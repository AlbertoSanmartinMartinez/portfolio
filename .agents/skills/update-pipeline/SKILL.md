---
name: update-pipeline
description: Changes CI/CD pipeline files (GitHub Actions or GitLab CI) following the project's rules — draft vs ready jobs, path-based planning, pinned actions, least privilege, single required check — and validates them locally. Use for any change to workflows, CI jobs or deploy automation.
---

# Update the pipeline

## When

A job is added or changed, a check becomes required, caching or path filters change, or deploy automation changes.

## Read first

- `docs/guides/ci-cd.md`: rules and project facts.
- The current pipeline files and the aggregator job.

## Steps

1. Change the smallest thing. Keep the aggregator as the single required check; add new jobs to its needs.
2. Draft runs fast checks only; anything slow runs on ready PRs and on `main`.
3. Path filters: make sure they cover every file the job depends on (code, lockfiles, Dockerfiles). Never `paths-ignore` code or lockfiles.
4. Pin every action or image by full SHA or digest, with a version comment. Look up the SHA of the tag; don't guess it.
5. Permissions: none by default, the minimum per job; secrets only in the step that needs them.
6. Validate locally: actionlint for GitHub Actions; `glab ci lint` or a YAML parse for GitLab; run `python3 scripts/check_harness.py`.
7. In the PR, say what can only be proven in CI (and watch it with `monitor-pull-request`) and what needs forge settings changed by a person (After Merge).

## Done when

- [ ] Local validation passes and the pipeline runs green on the PR.
- [ ] Pins, permissions and path filters follow the guide.

## Don't

- Don't weaken or remove a required check to get green.
- Don't cancel runs on `main` or add deploy steps an agent can trigger.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
