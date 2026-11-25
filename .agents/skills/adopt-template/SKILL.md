---
name: adopt-template
description: Adapts a freshly copied Agentic SDLC harness template to this project — fills Project facts and commands, keeps one forge, deletes topics, roles and MCP servers that don't apply, fills the docs, activates git hooks and runs the harness check until no TODO(adopt) remains. Use once, right after copying the template into a new or existing repo.
---

# Adopt the template

## When

Right after the template was copied: into an empty repo, or into `.harness-incoming/` of an existing repo. Once per project; later upgrades use `update-harness`.

## Read first

- `AGENTS.md` (every `TODO(adopt)`), `docs/harness.md`, `docs/guides/`.
- The repo itself: manifests and lockfiles (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`…), existing CI, Dockerfiles, README, `git remote -v`.

## Steps

1. Existing repo: merge `.harness-incoming/` file by file. Keep the project's README, `.gitignore`, CI and Compose content and add the template's parts to them; never overwrite. Delete `.harness-incoming/` at the end.
2. Detect what you can: languages, package managers, test and lint tools, forge (from the remote URL), existing services. Then ask the person, one question at a time with your recommended answer, only for what you can't detect: product line, tracker and how to reach it, release publishers, environment URLs, CODEOWNERS owner.
3. Fill "Project facts" and the Commands table in `AGENTS.md`, with quiet flags. Run each command once to prove it works.
4. Forge: keep `.github/` or `.gitlab/` plus `.gitlab-ci.yml`, delete the other. If the tracker is not the forge's issues, delete the issue templates.
5. Topics: ask which apply (database, HTTP API, generated clients, UI, feature flags, releases of a deployable). For each that doesn't, delete its guide in `docs/guides/` and its skill: migrations → `create-migration`; generated clients → `generate-client`; API contracts → `update-api-contract`; feature flags → `add-feature-flag`. No UI: delete `design-ui`, `review-ux` and the `designer` role. Remove their rows from `AGENTS.md`.
6. MCP: no database → remove `db-local` from `.mcp.json` and `DB_LOCAL_DSN` from `.env.example`. No web UI or playground → remove `browser`.
7. Local stack: adapt `compose.yaml` to the project's services and `scripts/stack.sh seed` to its data. A library with no services: delete `compose.yaml`, `orca.yaml` and `scripts/stack.sh`, and remove `run-local-stack` and its mentions.
8. Docs: `docs/architecture.md` from the code (components, boundaries, flows, paths); initial terms in `docs/glossary.md`; `docs/environments.md`; the date in ADR-0001; the README title and description. Unknown today ⇒ write "None yet", not `TODO(adopt)`.
9. Invariants: fix each "Enforced by" path you deleted, add the project's own invariants with their checks, and set the owner in CODEOWNERS.
10. Delete `CHANGELOG.md` (it belongs to the template). Keep `.harness-version`.
11. Activate the git hooks: `git config core.hooksPath .githooks`.
12. Run `python3 scripts/check_harness.py --adopted` and fix until it passes. It fails while any `TODO(adopt)` remains.
13. Commit on a branch and open a draft PR with `create-pull-request`. After Merge: branch protection on `main` with required checks and code owner review, and the CI secrets the workflows need — both done by a person in the forge settings.

## Done when

- [ ] `check_harness.py --adopted` passes.
- [ ] Every command in Project facts ran once.
- [ ] Only the topics, roles, MCP servers and forge files this project uses remain.

## Don't

- Don't overwrite existing project files.
- Don't invent facts; ask, or write "None yet".
- Don't change the harness rules themselves; propose that to the template instead.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
