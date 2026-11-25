---
name: verify-changes
description: Runs locally the checks CI will run for the changed paths (commands from Project facts plus the harness check) and returns the Definition of done from AGENTS.md marked item by item. Use before opening a PR, before asking for review, and when integrating work from several roles.
---

# Verify the changes

## When

Before `create-pull-request`, before asking for review, after fixing review findings, and when the tech-lead integrates work from several roles.

## Read first

- "Commands" and "Definition of done" in `AGENTS.md`.
- What CI really runs: the workflow files (`.github/workflows/` or `.gitlab-ci.yml`).

## Steps

1. What changed: `git diff --name-only origin/main...HEAD` and `git status --short`.
2. For each row of the Commands table whose paths match, run install (if the lockfile changed), lint, types and tests, with quiet flags. Always run `python3 scripts/check_harness.py`.
3. Checks no command covers, reviewed on the diff:
   - Schema changed ⇒ a migration is included (`docs/guides/migrations.md`).
   - API changed ⇒ generated clients regenerated (`docs/guides/generated-clients.md`).
   - New config ⇒ listed in `.env.example` (`docs/guides/config-secrets.md`).
   - New dependency ⇒ justified (`docs/guides/dependencies.md`).
   - Invariants touched ⇒ still hold (`docs/invariants.md`).
   - No secrets or personal data in code, logs, fixtures or docs.
4. User-facing change ⇒ `run-e2e-tests` has evidence, or say it is missing.
5. Report in this format, with only the minimal excerpt of each failure (`file:line` and the message):

```
Definition of done — <branch> @ <short sha>
✅ Checks for changed paths — <commands run>
❌ Migration for schema change — <file:line, message>
n/a Generated code — <why it does not apply>
Not run: <command> — <reason>
```

## Done when

- [ ] Every Definition of done item is ✅, ❌ with evidence, or n/a with a reason.
- [ ] Anything not run is listed with the reason.

## Don't

- Don't report a check as passed if you didn't run it.
- Don't paste whole logs.
- Don't "fix" failures by skipping or loosening checks.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
