# Generated clients

Code generated from a contract: API clients and types from an OpenAPI spec, SDKs, GraphQL or protobuf types. The contract is the source of truth; the generated code is never edited by hand. Skill: `generate-client`.

## Project facts

| Fact | Value |
| --- | --- |
| Source of truth | TODO(adopt): spec file, or the server code it is generated from |
| Generator and command | TODO(adopt) |
| Output paths | TODO(adopt) |
| Published as a package | TODO(adopt): no, or registry and package name |
| Consumers and deploy order | TODO(adopt) |

## Rules

1. Generated files carry a "generated — do not edit" header and are committed, so agents and reviewers can read them without running anything.
2. Never edit them by hand. Change the source and regenerate.
3. Regenerate in the same PR that changes the contract. Prefer generating offline, from the app or spec, without a running server or database.
4. If the generated diff contains endpoints or types you didn't touch, your branch is behind `main`: merge `main` first.
5. A published client gets a version bump with every contract change; consumers are deployed after the producer.
6. Hand-written wrappers around the client live outside the generated paths.

## Checks

| Rule | Enforced by |
| --- | --- |
| Generated code matches its source (1–3) | CI regenerates and runs `git diff --exit-code` on the output paths: TODO(adopt) |
| No hand edits (2) | `deny` of `Edit(<output path>/**)` in `.claude/settings.json`: TODO(adopt) |
| Contract changes reviewed (3) | `update-api-contract`, `review-code` |
