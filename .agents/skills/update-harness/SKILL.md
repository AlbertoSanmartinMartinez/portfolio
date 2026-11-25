---
name: update-harness
description: Brings a newer Agentic SDLC harness template version into this project with a per-file three-way merge (old template, new template, this project), keeping everything the project filled in, and opens a draft PR. Use when the template has a newer harness-vX.Y.Z tag than .harness-version.
---

# Update the harness

## When

A newer `harness-vX.Y.Z` tag exists in Agentic-SDLC than this project's `.harness-version`, or a person asks for the update.

## Read first

- `.harness-version` here.
- A clone of Agentic-SDLC (ask the person for its path, or clone it into `$(git rev-parse --git-dir)/harness-update/`), and its `template/CHANGELOG.md` between the two versions.

## Steps

1. Versions: `OLD=harness-v$(cat .harness-version)`, `NEW` = the latest tag (`git -C "$SDLC" tag --list 'harness-v*' --sort=-v:refname | head -1`). Same ⇒ stop.
2. Summarize the CHANGELOG entries between them for the person and the PR.
3. List the template changes: `git -C "$SDLC" diff --name-status "$OLD" "$NEW" -- template/`. Ignore `template/CHANGELOG.md`.
4. For each modified file `F` (path relative to `template/`) that exists here, merge three ways:

```bash
W=$(git rev-parse --git-dir)/harness-update; mkdir -p "$W"
git -C "$SDLC" show "$OLD:template/$F" > "$W/base"
git -C "$SDLC" show "$NEW:template/$F" > "$W/theirs"
git merge-file "$F" "$W/base" "$W/theirs"   # conflict markers where both sides changed
```

5. Conflicts: keep the project's values (Project facts, commands, owners, its own invariants and rules) and take the template's new wording around them. Resolve every marker.
6. A modified file that doesn't exist here was deleted at adoption (other forge, unused topic): skip it and list it in the PR.
7. Added files: copy them, unless they belong to a topic or forge this project removed; then list them and ask.
8. Deleted files: delete them here if unchanged since `OLD` (compare with `git -C "$SDLC" show "$OLD:template/$F"`); otherwise ask.
9. Symlinks and executable bits: keep them as in the template (`.claude/skills`, `.claude/agents`, hooks and scripts).
10. Write the new version to `.harness-version`, run `python3 scripts/check_harness.py --adopted` and `verify-changes`.
11. Open a draft PR with `create-pull-request`: the changelog summary, the files merged, skipped and asked about.

## Done when

- [ ] No conflict markers remain and the harness check passes.
- [ ] `.harness-version` holds the new version.
- [ ] The PR lists merged, skipped and new files.

## Don't

- Don't overwrite project files with the template's version.
- Don't skip versions' breaking notes in the CHANGELOG; apply their migration steps.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
