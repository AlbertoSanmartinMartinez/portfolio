# Releases

How a version gets from `main` to production. An agent prepares; a named person publishes. Skill: `prepare-release`.

## Project facts

| Fact | Value |
| --- | --- |
| Versioning | Semver tags `vX.Y.Z` on `main` |
| Publishers | TODO(adopt): people allowed to tag and publish |
| How to publish | TODO(adopt): `git tag -a vX.Y.Z` + push, a release workflow, or the forge UI |
| Changelog | TODO(adopt): file, or the forge release notes |
| Deploy after publish | TODO(adopt) |

## Rules

1. Releases come from `main` only, at a commit whose CI is green.
2. The version follows conventional commits since the last tag: breaking change → major, `feat` → minor, otherwise patch.
3. The inventory uses `git log --first-parent <last tag>..main`, not search.
4. Every unchecked After Merge item since the last tag is in the release checklist with an owner.
5. Only a publisher tags and publishes; the release workflow checks who triggered it and fails closed.
6. Rollback is redeploying the previous tag through the same pipeline. Migrations are not reverted; fixes go forward.
7. Hotfix: branch from the release tag, fix with a test, release a patch, and merge the fix into `main` as well.
8. After publishing: verify the deploy, run a read-only smoke e2e in prod with the publisher's OK, and close the After Merge items.

## Checks

| Rule | Enforced by |
| --- | --- |
| Agents don't publish (5) | `.agents/hooks/block-unsafe-commands.sh`, `deny` in `.claude/settings.json` |
| Who may publish (5) | TODO(adopt): actor check in the release workflow, tag protection in the forge |
