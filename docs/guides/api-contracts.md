# API contracts

How a public or internal API changes without breaking its callers. Skill: `update-api-contract`, which calls `generate-client`.

## Project facts

| Fact | Value |
| --- | --- |
| Contract format and file | OpenAPI 3.1, `openapi/openapi.yaml` |
| Versioning scheme | URL prefix `/api/v1` |
| Breaking-change detector | oasdiff in `.github/workflows/ci.yml` |
| Known consumers | The site's own contact form |
| Deprecation window | None while the site is the only consumer; 30 days if an external one appears |

## Rules

1. The contract is reviewed like code: its diff is part of the PR.
2. Additive changes don't break: new optional fields, new endpoints, new enum values only if clients tolerate unknown ones.
3. Removing or renaming anything, changing types, making fields required or changing semantics breaks. A breaking change needs a new version or a deprecation window announced in the changelog.
4. Deprecated parts are marked in the contract, keep working until the window ends, and their removal is a tracked task.
5. Errors have a stable shape and codes that callers can rely on.
6. Every contract change regenerates the clients in the same PR (`docs/guides/generated-clients.md`).

## Checks

| Rule | Enforced by |
| --- | --- |
| No unannounced breaking change (3) | oasdiff against the base branch in `.github/workflows/ci.yml` |
| Clients regenerated (6) | Drift check from `generated-clients.md` |
