---
name: create-migration
description: Writes a database migration that stays compatible with the deployed code (expand, migrate, contract), keeps one head, includes a working down step, and records when and by whom it runs. Use whenever the plan changes the schema or needs a data backfill.
---

# Create a migration

## When

A plan step changes tables, columns, indexes, constraints, policies or data in bulk.

## Read first

- `docs/guides/migrations.md`: rules and the project facts (tool, commands, who writes and runs migrations).
- The plan's "Data and migrations" section and the models it changes.
- The latest migrations, to copy naming and style.

## Steps

1. If the project facts say people write migrations, stop and hand the change to a person with the exact schema you need.
2. Check there is one head with the tool's command. Two heads: merge `main` and re-parent your migration; never add a merge revision.
3. Decide the phase: expand (add, nullable, new table), migrate (backfill), or contract (drop, in a later release). One phase per migration.
4. Create the revision with the project's command and naming convention. Write `up`, then a complete `down` in reverse order.
5. Align the models with the migration and regenerate anything derived from the schema (types, generated clients).
6. Backfills: in batches over the primary key, idempotent, logged; no single huge transaction. Big indexes without blocking writes when the database allows.
7. Tenant or user data: apply the same isolation (policies, grants) as existing tables.
8. Apply it locally on the stack (`run-local-stack`), run `down`, apply again, then run the related tests.
9. In the PR Risk section: the phase, whether it needs the previous release first, and the lock or duration risk. In After Merge: who runs it in each environment, unless the pipeline does.

## Done when

- [ ] One head; the migration applies, rolls back and re-applies on the local stack.
- [ ] The deployed code keeps working after it runs.
- [ ] Models, derived types and tests are updated; Risk and After Merge are filled.

## Don't

- Don't edit a migration already on `main`.
- Don't drop or rename in the same release that stops using it.
- Don't run migrations against shared databases.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
