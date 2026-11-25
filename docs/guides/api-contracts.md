# API contracts

How a public or internal API changes without breaking its callers. Skill: `update-api-contract`, which calls `generate-client`.

## Project facts

| Fact | Value |
| --- | --- |
| Contract format and file | TODO(adopt): OpenAPI, GraphQL SDL, protobuf… |
| Versioning scheme | TODO(adopt): URL prefix, header, or schema evolution only |
| Breaking-change detector | TODO(adopt): oasdiff, graphql-inspector, buf breaking… |
| Known consumers | TODO(adopt) |
| Deprecation window | TODO(adopt) |

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
| No unannounced breaking change (3) | TODO(adopt): detector in CI against `main` |
| Clients regenerated (6) | Drift check from `generated-clients.md` |
