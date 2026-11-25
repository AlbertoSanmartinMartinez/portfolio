---
name: create-pull-request
description: Creates the branch, conventional commits and a draft pull request (or GitLab merge request) with the template's Summary, Evidence, Risk and After Merge sections, using the forge CLI from Project facts. Use when the work is ready for CI or review.
---

# Create a pull request

## When

The branch has work ready for CI or for a person to see. If `verify-changes` has not run yet, run it first.

## Read first

- "Project facts" (forge, CLI, term, branch naming) and "Pull requests" in `AGENTS.md`.
- The PR template: `.github/pull_request_template.md` or `.gitlab/merge_request_templates/default.md`.
- `git log --oneline -15 origin/main` to match the commit style.

## Steps

1. Branch. Never work on `main`. If you are already on a work branch (Orca creates one per worktree), stay on it. Otherwise create `<type>/<key>-<slug>` from an up-to-date `origin/main`: `type` from the main commit (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`), `key` from the tracker (omit if none), `slug` two to five words.
2. Commits: conventional (`feat(scope): …`), one per meaningful change, ending with the attribution line your environment gives you, if any.
3. To catch up with `main`, merge it (`git pull --no-rebase origin main`); don't rebase published commits.
4. Write the body from the template into a file outside version control (for example under `.git/`):
   - Summary: what and why; link the spec folder and the tracker item.
   - Evidence: the `verify-changes` report and the `run-e2e-tests` table.
   - Risk: revert level, impact, and any migration, generated code, config or dependency.
   - After Merge: one checkbox per task with who does it, or "None".
5. Push and open it as a draft:
   - GitHub: `gh pr create --draft --base main --title "<type>(<scope>): <what>" --body-file <file>`
   - GitLab: `glab mr create --draft --target-branch main --title "…" --description "$(cat <file>)"`
6. Hand over to `monitor-pull-request`. A person marks it ready.

## Done when

- [ ] The PR or MR is a draft against `main`, with a conventional title.
- [ ] The body has Summary, Evidence, Risk and After Merge filled in.
- [ ] CI started on it.

## Don't

- Don't mark it ready, merge, or enable auto-merge.
- Don't force-push or rewrite published commits unless a person asks.
- Don't put secrets, customer names or personal data in titles, bodies or branch names.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
