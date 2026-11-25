---
name: prepare-release
description: Inventories everything between the last release tag and main (PRs, unchecked After Merge items, migrations, config, secrets, dependencies, images), proposes the semver version and changelog, and returns an ordered checklist for the person who publishes, with risks and rollback. Never tags or publishes. Use before every release.
---

# Prepare a release

## When

A person wants to cut a release from `main`. You prepare; a publisher named in Project facts tags and publishes.

## Read first

- `docs/guides/releases.md`: versioning, who publishes, rollback, hotfix.
- `docs/guides/migrations.md` and `docs/guides/config-secrets.md`.
- The last tag: `git describe --tags --abbrev=0 --match 'v*' origin/main`.

## Steps

1. Candidate: `origin/main` at its current SHA. Its CI must be green; if not, stop and report.
2. Changes: `git log --first-parent --oneline <last tag>..origin/main`. Map each merge to its PR (forge CLI) and tracker item. Don't rely on search, which misses PRs.
3. From each PR collect: unchecked After Merge items, Risk section, migrations, new or changed config variables and secrets, new dependencies, changed images or deploy files, feature flags turned on or due for removal.
4. Version: from conventional commits since the tag. A breaking change gives a major, a `feat` a minor, otherwise a patch.
5. Changelog: group by Added, Changed, Fixed, Security; one line per user-visible change, in plain words. Internal refactors go under one line or are left out.
6. Checklist for the publisher, in the order they must happen:
   - Before: backups, secrets and config per environment, migrations (who runs them and when).
   - Publish: the tag and release commands from `docs/guides/releases.md`.
   - After: deploy verification, `run-e2e-tests` read-only smoke in prod (with their OK), the remaining After Merge items with their owners.
7. Risks: what is most likely to break, how it would show, and the rollback: redeploy the previous tag; migrations are not reverted, a forward fix is.
8. Deliver it as text for the person, or as a comment on the release item in the tracker.

## Done when

- [ ] Every PR since the last tag is in the inventory.
- [ ] Every unchecked After Merge item is in the checklist with an owner.
- [ ] The version, changelog, risks and rollback are proposed.

## Don't

- Don't create tags, releases or deployments, not even drafts.
- Don't mark After Merge items done for other people.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
