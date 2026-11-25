---
name: update-api-contract
description: Changes an API contract (OpenAPI, GraphQL, protobuf) safely — classifies the change as additive or breaking, versions or deprecates when it breaks, runs the breaking-change detector, and regenerates clients. Use whenever an endpoint, schema, field, enum or error shape changes.
---

# Update an API contract

## When

The plan adds, changes or removes an endpoint, field, type, enum value or error shape.

## Read first

- `docs/guides/api-contracts.md`: format, versioning, detector, consumers, deprecation window.
- The plan's "Interfaces" section.

## Steps

1. Classify each change: additive (new optional field, new endpoint) or breaking (remove, rename, type change, newly required, semantic change).
2. Breaking: add a new version or keep the old shape working and mark it deprecated with the removal date; add the changelog note and a tracker item for the removal.
3. Change the contract (or the server code it is generated from) and its implementation together.
4. Errors keep their stable shape and codes.
5. Run the breaking-change detector against `main` and explain every reported break in the PR.
6. Regenerate clients with `generate-client`.
7. Tests for the new and the deprecated behavior; e2e or playground check with `run-e2e-tests` for user-visible changes.

## Done when

- [ ] The detector passes, or each break is versioned or deprecated and explained.
- [ ] Clients are regenerated; tests cover old and new behavior.

## Don't

- Don't ship an unannounced breaking change.
- Don't remove deprecated parts before the window ends.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
