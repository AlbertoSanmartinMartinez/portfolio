#!/usr/bin/env python3
"""Checks the agent harness of this repo (INV-002). Standard library only.

    python3 scripts/check_harness.py [--adopted] [ROOT]

ROOT defaults to the git top level. --adopted also fails while any TODO(adopt)
placeholder remains, which is how adopt-template knows it is finished.
Exit code 1 and one line per problem when something is wrong.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tomllib
from pathlib import Path

SKILL_VERBS = {
    "write", "record", "design", "run", "verify", "create", "monitor", "review",
    "prepare", "respond", "adopt", "generate", "add", "update",
}
HOOK_VERBS = {"block", "scan", "format"}
SKILL_KEYS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
SKILL_SECTIONS = ["## When", "## Read first", "## Steps", "## Done when", "## Don't", "## Improve this skill"]
KEBAB = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
EXACT_VERSION = re.compile(r"^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$")
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "dist", "build", ".playwright-mcp", "vendor", ".harness-incoming"}
BUDGETS = {"AGENTS.md": 150, "nested AGENTS.md": 40, "skill": 120, "role": 80}
PLACEHOLDER = re.compile(r"TODO\(adopt\)|TODO-adopt")

errors: list[str] = []


def fail(path: Path | str, message: str) -> None:
    errors.append(f"{path}: {message}")


def walk(root: Path):
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        yield path


def frontmatter(path: Path) -> tuple[dict[str, str], list[str]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        fail(path, "missing frontmatter")
        return {}, lines
    end = lines.index("---", 1)
    meta: dict[str, str] = {}
    for line in lines[1:end]:
        if line.startswith((" ", "\t", "-")) or not line.strip():
            continue  # nested values and list items belong to the previous key
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, lines[end + 1:]


def check_instructions(root: Path) -> None:
    agents = root / "AGENTS.md"
    if not agents.is_file():
        fail("AGENTS.md", "missing")
    elif len(agents.read_text(encoding="utf-8").splitlines()) > BUDGETS["AGENTS.md"]:
        fail("AGENTS.md", f"longer than {BUDGETS['AGENTS.md']} lines")
    for path in walk(root):
        if path.name != "AGENTS.md" or path.is_symlink():
            continue
        rel = path.relative_to(root)
        claude = path.with_name("CLAUDE.md")
        if not claude.is_file() or claude.read_text(encoding="utf-8").strip() != "@AGENTS.md":
            fail(rel.with_name("CLAUDE.md"), "must exist next to AGENTS.md and contain only @AGENTS.md")
        if path != agents and len(path.read_text(encoding="utf-8").splitlines()) > BUDGETS["nested AGENTS.md"]:
            fail(rel, f"nested AGENTS.md longer than {BUDGETS['nested AGENTS.md']} lines")


def check_skills(root: Path) -> None:
    skills = root / ".agents" / "skills"
    links = root / ".claude" / "skills"
    names = set()
    for folder in sorted(p for p in skills.iterdir() if p.is_dir()) if skills.is_dir() else []:
        name = folder.name
        names.add(name)
        skill = folder / "SKILL.md"
        rel = skill.relative_to(root)
        if not skill.is_file():
            fail(rel, "missing")
            continue
        meta, body = frontmatter(skill)
        if meta.get("name") != name:
            fail(rel, f"name must equal the folder name '{name}'")
        if not KEBAB.match(name) or len(name) > 64:
            fail(rel, "name must be lowercase words joined by single hyphens, 64 characters at most")
        words = name.split("-")
        if not 2 <= len(words) <= 3 or words[0] not in SKILL_VERBS:
            fail(rel, f"name must be <action>-<object> in 2-3 words with an action from {sorted(SKILL_VERBS)}")
        if not meta.get("description") or len(meta["description"]) > 1024:
            fail(rel, "description is required, on one line, 1024 characters at most")
        if unknown := set(meta) - SKILL_KEYS:
            fail(rel, f"non-portable frontmatter keys: {sorted(unknown)}")
        if len(body) > BUDGETS["skill"]:
            fail(rel, f"longer than {BUDGETS['skill']} lines")
        text = "\n".join(body)
        for section in SKILL_SECTIONS:
            if not re.search(rf"^{re.escape(section)}\s*$", text, re.M):
                fail(rel, f"missing section '{section}'")
        if "${CLAUDE_" in text or "$ARGUMENTS" in text:
            fail(rel, "uses Claude-only variables; skills must work in every agent")
        link = links / name
        if not link.is_symlink() or link.resolve() != folder.resolve():
            fail(f".claude/skills/{name}", f"must be a symlink to ../../.agents/skills/{name}")
    for extra in sorted(links.iterdir()) if links.is_dir() else []:
        if extra.name not in names:
            fail(extra.relative_to(root), "has no matching skill in .agents/skills")


def check_roles(root: Path) -> None:
    roles = root / ".claude" / "agents"
    for role in sorted(roles.glob("*.md")) if roles.is_dir() else []:
        rel = role.relative_to(root)
        meta, body = frontmatter(role)
        if meta.get("name") != role.stem:
            fail(rel, "name must equal the file name")
        if not re.match(r"^[a-z]+(-[a-z]+)?$", role.stem):
            fail(rel, "role names are a noun of 1-2 words joined by a hyphen")
        if not meta.get("description"):
            fail(rel, "description is required")
        if len(body) > BUDGETS["role"]:
            fail(rel, f"longer than {BUDGETS['role']} lines")
        if not re.search(r"^## Handoff\s*$", "\n".join(body), re.M):
            fail(rel, "missing '## Handoff' section")


def check_hooks(root: Path) -> None:
    for folder, verbs in ((root / ".agents" / "hooks", HOOK_VERBS), (root / ".githooks", None)):
        for script in sorted(folder.iterdir()) if folder.is_dir() else []:
            rel = script.relative_to(root)
            if not script.stat().st_mode & 0o111:
                fail(rel, "must be executable")
            if verbs is not None:
                stem = script.name.removesuffix(".sh")
                words = stem.split("-")
                if script.suffix != ".sh" or not KEBAB.match(stem) or words[0] not in verbs or len(words) > 3:
                    fail(rel, f"hook scripts are <action>-<object>.sh with an action from {sorted(verbs)}")


def npm_spec_problem(args: list[str]) -> str | None:
    """Returns a problem with the npm package spec in npx args, or None."""
    specs = [a for a in args if not a.startswith("-")]
    if not specs:
        return "no package"
    spec = specs[0]
    at = spec.rfind("@")
    if at <= 0:
        return f"'{spec}' has no version"
    version = spec[at + 1:]
    if not EXACT_VERSION.match(version):
        return f"'{spec}' must pin an exact version"
    return None


def mcp_servers_from_json(path: Path) -> dict[str, dict]:
    try:
        return json.loads(path.read_text(encoding="utf-8")).get("mcpServers", {})
    except ValueError as exc:
        fail(path.name, f"invalid JSON: {exc}")
        return {}


def check_mcp(root: Path) -> None:
    mcp = root / ".mcp.json"
    if not mcp.is_file():
        return
    servers = mcp_servers_from_json(mcp)
    for name, server in servers.items():
        if not KEBAB.match(name) or len(name.split("-")) > 2:
            fail(".mcp.json", f"server '{name}': names are the system it reaches, 1-2 words")
        if server.get("command") in ("npx", "bunx", "pnpx") and (problem := npm_spec_problem(server.get("args", []))):
            fail(".mcp.json", f"server '{name}': {problem}")
        for key, value in (server.get("env") or {}).items():
            if value and not re.fullmatch(r"\$\{[A-Z0-9_]+(:-[^}]*)?\}", str(value)):
                fail(".mcp.json", f"server '{name}': env {key} must reference a variable, never hold a value")
        for header, value in (server.get("headers") or {}).items():
            if value and "${" not in str(value):
                fail(".mcp.json", f"server '{name}': header {header} must reference a variable")
    cursor = root / ".cursor" / "mcp.json"
    if cursor.exists() and (not cursor.is_symlink() or cursor.resolve() != mcp.resolve()):
        fail(".cursor/mcp.json", "must be a symlink to ../.mcp.json")
    codex = root / ".codex" / "config.toml"
    if codex.is_file():
        try:
            mirror = tomllib.loads(codex.read_text(encoding="utf-8")).get("mcp_servers", {})
        except tomllib.TOMLDecodeError as exc:
            fail(".codex/config.toml", f"invalid TOML: {exc}")
            return
        if set(mirror) != set(servers):
            fail(".codex/config.toml", f"mcp_servers {sorted(mirror)} differ from .mcp.json {sorted(servers)}")
        for name in set(mirror) & set(servers):
            for key in ("command", "args"):
                if mirror[name].get(key) != servers[name].get(key):
                    fail(".codex/config.toml", f"mcp_servers.{name}.{key} differs from .mcp.json")


def check_invariants(root: Path) -> None:
    doc = root / "docs" / "invariants.md"
    if not doc.is_file():
        return
    for number, line in enumerate(doc.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip().startswith("- Enforced by:"):
            paths = re.findall(r"`([^`]+)`", line)
            if not paths:
                fail(f"docs/invariants.md:{number}", "'Enforced by' names no check")
            for item in paths:
                if not (root / item).exists():
                    fail(f"docs/invariants.md:{number}", f"enforcing check '{item}' does not exist")


def check_pins(root: Path) -> None:
    for workflow in sorted((root / ".github" / "workflows").glob("*.y*ml")):
        for number, line in enumerate(workflow.read_text(encoding="utf-8").splitlines(), 1):
            match = re.search(r"uses:\s*([^\s#]+)", line)
            if match and not match.group(1).startswith(("./", "docker://")):
                if not re.search(r"@[0-9a-f]{40}$", match.group(1)):
                    fail(f"{workflow.relative_to(root)}:{number}", "pin actions by full commit SHA")
            image = re.search(r"(?:image|container):\s*['\"]?([^\s'\"#]+)", line)
            if image and "/" in image.group(1) + ":" and "@sha256:" not in image.group(1) and "${{" not in image.group(1):
                fail(f"{workflow.relative_to(root)}:{number}", "pin images by digest")
    for name in (".gitlab-ci.yml", "compose.yaml"):
        path = root / name
        if path.is_file():
            for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                image = re.match(r"\s*(?:-\s*)?(?:image|name):\s*['\"]?([^\s'\"#]+)", line)
                if image and ":" in image.group(1) and "@sha256:" not in image.group(1) and "$" not in image.group(1):
                    fail(f"{name}:{number}", "pin images by digest")


def placeholder_doc(rel: Path) -> bool:
    """Files that talk about the placeholder rather than contain one."""
    return rel.name == "check_harness.py" or rel.parts[:3] == (".agents", "skills", "adopt-template")


def check_links_and_symlinks(root: Path, adopted: bool) -> None:
    for path in walk(root):
        rel = path.relative_to(root)
        if path.is_symlink() and not path.exists():
            fail(rel, "broken symlink")
            continue
        if path.is_dir() or path.suffix not in {".md", ".json", ".toml", ".yml", ".yaml", ".sh", ".py", ""}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if adopted and not placeholder_doc(rel) and PLACEHOLDER.search(text):
            fail(rel, "TODO(adopt) placeholders remain")
        if path.suffix != ".md":
            continue
        in_code = False
        for number, line in enumerate(text.splitlines(), 1):
            if line.lstrip().startswith("```"):
                in_code = not in_code
            if in_code:
                continue
            for target in re.findall(r"\]\(([^)\s]+)\)", re.sub(r"`[^`]*`", "", line)):
                if re.match(r"^[a-z]+:", target) or target.startswith("#"):
                    continue
                if not (path.parent / target.split("#")[0]).exists():
                    fail(f"{rel}:{number}", f"broken link to '{target}'")


def check_specs_and_version(root: Path) -> None:
    specs = root / "specs"
    for folder in sorted(p for p in specs.iterdir() if p.is_dir()) if specs.is_dir() else []:
        if not re.match(r"^\d{3}-[a-z0-9]+(-[a-z0-9]+)*$", folder.name):
            fail(folder.relative_to(root), "spec folders are <NNN>-<kebab-slug>")
    version = root / ".harness-version"
    if not version.is_file() or not EXACT_VERSION.match(version.read_text(encoding="utf-8").strip()):
        fail(".harness-version", "must hold the template version (X.Y.Z)")


def main(argv: list[str]) -> int:
    adopted = "--adopted" in argv
    args = [a for a in argv if not a.startswith("--")]
    if args:
        root = Path(args[0]).resolve()
    else:
        top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True)
        root = Path(top.stdout.strip() or ".").resolve()
    for check in (check_instructions, check_skills, check_roles, check_hooks, check_mcp,
                  check_invariants, check_pins, check_specs_and_version):
        check(root)
    check_links_and_symlinks(root, adopted)
    for error in errors:
        print(error)
    if errors:
        print(f"harness check: {len(errors)} problem(s)", file=sys.stderr)
        return 1
    print("harness check: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
