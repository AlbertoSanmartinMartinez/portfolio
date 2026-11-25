# CI/CD

How changes are checked, built and deployed. Pipelines are code and follow the same review as everything else. Skill: `update-pipeline`.

## Project facts

| Fact | Value |
| --- | --- |
| CI provider and files | GitHub Actions, `.github/workflows/` |
| Required check | `ci-ok` and `quality-ok` |
| Registry and image tags | None: App Platform builds from the repository |
| Deploy mechanism | DigitalOcean App Platform with managed PostgreSQL; the trigger is decided in `specs/003` |
| Environments and approvals | `docs/environments.md` |

## Rules

1. Trunk-based: short branches from `main`, merged through PRs. Releases are tags on `main`.
2. One aggregator job is the only required check, so skipped jobs never block a merge.
3. Draft PRs run the fast checks (lint, types, harness). Ready PRs run the full suite and builds. To push fixes to a ready PR, put it back to draft first. Some review bots skip drafts (Copilot); if the project relies on one, say so here.
4. Jobs run according to the changed paths, and a test proves each image's path filter covers the files it copies. No `paths-ignore` that hides code or lockfiles.
5. Cancel superseded runs on PRs; never cancel runs on `main`.
6. Actions and images are pinned by full SHA or digest, with a version comment.
7. Least privilege: default `permissions: {}` or read-only; each secret only in the step that needs it; OIDC to cloud providers instead of long-lived keys.
8. PRs build but don't publish. `main` publishes immutable tags (`<sha>`), and moving tags never go backwards.
9. Build once, promote the same artifact through environments. Production needs an approval.
10. Agents never deploy, apply infrastructure or run `kubectl`, `helm upgrade` or `terraform apply` against shared environments.

## Checks

| Rule | Enforced by |
| --- | --- |
| Harness, secrets, static analysis, vulnerable dependencies | `.github/workflows/quality.yml`, `.gitlab-ci.yml` |
| Pinned actions (6) | `scripts/check_harness.py` |
| Workflow syntax | actionlint in `.github/workflows/quality.yml` |
| Pipeline edits reviewed | CODEOWNERS, `ask` in `.claude/settings.json` |
| Protected `main` and required check (1, 2) | Branch protection on `main` in the GitHub settings, set by Alberto |
