# Generated clients

Code generated from a contract: API clients and types from an OpenAPI spec, SDKs, GraphQL or protobuf types. The contract is the source of truth; the generated code is never edited by hand. Skill: `generate-client`.

## Project facts

| Fact | Value |
| --- | --- |
| Source of truth | `openapi/openapi.yaml` |
| Generator and command | openapi-typescript: `pnpm api:generate`; calls go through openapi-fetch in `src/lib/api/client.ts` |
| Output paths | `src/lib/api/schema.d.ts` |
| Published as a package | No |
| Consumers and deploy order | The site's own contact form; deployed together |

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
| Generated code matches its source (1–3) | CI regenerates and runs `git diff --exit-code src/lib/api/schema.d.ts` in `.github/workflows/ci.yml` |
| No hand edits (2) | `deny` of `Edit(**/src/lib/api/schema.d.ts)` in `.claude/settings.json` |
| Contract changes reviewed (3) | `update-api-contract`, `review-code` |
