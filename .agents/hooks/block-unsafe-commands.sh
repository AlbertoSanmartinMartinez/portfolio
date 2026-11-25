#!/usr/bin/env bash
# Pre-shell-command guard for coding agents (INV-003, INV-004). It blocks:
#   - skipping git hooks (--no-verify, git commit -n)
#   - force-pushes, direct pushes to protected branches, pushing tags
#   - merging PRs/MRs, admin merges, marking them ready, opening them without --draft
#   - creating releases
#   - setting the escape hatch HARNESS_ALLOW_PROTECTED_PUSH
# Registered in .claude/settings.json (also read by Cursor and Copilot) and
# .codex/hooks.json. Reads the hook payload on stdin; the command may be in
# tool_input.command (Claude, Codex, Gemini, Hermes), command (Cursor) or
# toolArgs (Copilot). Exit 2 blocks, with the reason on stderr. Fails closed:
# an unreadable payload is blocked too. This is a guardrail, not a security
# boundary: a determined command can get around pattern matching.
set -uo pipefail

payload=$(cat)
if ! command -v python3 >/dev/null 2>&1; then
  echo "blocked: python3 is required by the harness guard" >&2
  exit 2
fi

HOOK_PAYLOAD="$payload" HOOK_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)" python3 - <<'PY'
import json, os, re, shlex, sys

def deny(reason):
    print(f"blocked by harness guard: {reason}", file=sys.stderr)
    sys.exit(2)

try:
    data = json.loads(os.environ["HOOK_PAYLOAD"] or "{}")
except ValueError:
    deny("unreadable hook payload")

cmd = None
ti = data.get("tool_input")
if isinstance(ti, dict):
    cmd = ti.get("command")
if cmd is None:
    cmd = data.get("command")
if cmd is None and "toolArgs" in data:
    ta = data["toolArgs"]
    if isinstance(ta, str):
        try:
            ta = json.loads(ta)
        except ValueError:
            ta = {"command": ta}
    if isinstance(ta, dict):
        cmd = ta.get("command")
if cmd is None:
    sys.exit(0)  # not a shell command
if not isinstance(cmd, str):
    deny("unexpected command format")

protected = os.environ.get("HARNESS_PROTECTED_BRANCHES", "main master").split()
branch = os.environ.get("HOOK_BRANCH", "")
text = " ".join(cmd.split())

if "HARNESS_ALLOW_PROTECTED_PUSH" in text:
    deny("only a person may set HARNESS_ALLOW_PROTECTED_PUSH")
if "--no-verify" in text:
    deny("--no-verify skips the git hooks")

for seg in re.split(r"&&|\|\||;|\||\n", cmd):
    words = seg.split()
    if not words:
        continue
    s = " ".join(words)
    try:
        tokens = shlex.split(seg)
    except ValueError:
        tokens = words
    if "git" in tokens and "commit" in tokens and "-n" in tokens:
        deny("git commit -n skips the git hooks")
    if re.search(r"\bgit\b.*\bpush\b", s):
        if re.search(r"(^|\s)(--force|--force-with-lease|-f)(=\S+)?(\s|$)", s) or re.search(r"\s\+\S+", s):
            deny("force-push is not allowed")
        if re.search(r"(^|\s)(--tags|--follow-tags)(\s|$)|refs/tags/|\sv\d+\.\d+\.\d+(\s|$)", s):
            deny("pushing tags publishes a release; a person does that")
        if re.search(r"(^|\s)--delete(\s|$)|\s:\S+", s):
            deny("deleting remote refs is not allowed")
        after = s.split("push", 1)[1].split()
        refs = [w for w in after if not w.startswith("-")]
        targets = [r.split(":")[-1] for r in refs[1:]]
        if any(t.removeprefix("refs/heads/") in protected for t in targets):
            deny(f"direct push to a protected branch ({', '.join(protected)})")
        if len(refs) <= 1 and branch in protected:
            deny(f"you are on {branch}; push a work branch instead")
    if re.search(r"\b(gh\s+pr|glab\s+mr)\s+merge\b", s):
        deny("agents never merge; a person does")
    if re.search(r"\bgh\s+pr\s+ready\b", s) and "--undo" not in s:
        deny("agents never mark a PR ready; a person does")
    if re.search(r"\bglab\s+mr\s+update\b", s) and re.search(r"(^|\s)--ready(\s|$)", s):
        deny("agents never mark an MR ready; a person does")
    if re.search(r"\bgh\s+pr\s+create\b", s) and not re.search(r"(^|\s)(--draft|-d)(\s|$)", s):
        deny("open pull requests as drafts: gh pr create --draft")
    if re.search(r"\bglab\s+mr\s+create\b", s) and not re.search(r"(^|\s)--draft(\s|$)", s):
        deny("open merge requests as drafts: glab mr create --draft")
    if re.search(r"\b(gh|glab)\s+release\s+(create|upload|edit|delete)\b", s):
        deny("releases are published by a person")
    if re.search(r"--admin\b", s) and re.search(r"\b(gh|glab)\b", s):
        deny("admin overrides are not allowed")
sys.exit(0)
PY
