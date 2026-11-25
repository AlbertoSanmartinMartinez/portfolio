---
name: generate-client
description: Regenerates code derived from a contract (API clients and types from OpenAPI, GraphQL or protobuf), checks the diff only contains the intended changes, and adapts the hand-written layer around it. Use after any change to an API contract or schema the generator reads.
---

# Generate a client

## When

A route, schema, enum, operation id or message changed, or `update-api-contract` asks for it. Also when CI's drift check fails.

## Read first

- `docs/guides/generated-clients.md`: source of truth, generator command, output paths.
- The contract diff of this branch.

## Steps

1. Make sure the branch is current: merge `origin/main` if it is behind.
2. Run the generator command from the guide. Prefer the offline mode that reads the app or spec without a running server.
3. Inspect `git diff --stat` on the output paths. Every change must come from this branch's contract change. Unrelated endpoints or types mean a stale branch or a stale spec: stop and fix that first.
4. Adapt the hand-written code that uses the client (outside the generated paths), then run types and tests for the consumers.
5. Published client: bump its version as the guide says and add the publish step to After Merge.
6. Commit the generated files together with the contract change.

## Done when

- [ ] Regenerating again produces no diff.
- [ ] Consumers type-check and their tests pass.
- [ ] Generated and contract changes are in the same PR.

## Don't

- Don't edit generated files by hand.
- Don't regenerate from a running shared environment's spec when an offline source exists.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
