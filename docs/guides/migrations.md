# Migrations

How the database schema changes. Migrations run before the new code is live, while the old code still serves traffic, so every migration must work with both. Skill: `create-migration`.

## Project facts

| Fact | Value |
| --- | --- |
| Database and migration tool | PostgreSQL 17; Drizzle ORM and Drizzle Kit |
| Create a migration | Edit `src/db/schema.ts`, then `pnpm drizzle-kit generate --name <slug>` |
| Apply / roll back locally | `pnpm drizzle-kit migrate`. Drizzle Kit has no down migrations: rule 7 is met by a forward migration that reverts the change, written and tested in the same PR when the change is risky |
| Naming convention | `drizzle/NNNN_<slug>.sql`, numbered by Drizzle Kit |
| Autogenerate allowed | Yes, from the schema; the generated SQL is reviewed and committed |
| Who writes migrations | Agents, reviewed by Alberto in the PR |
| Who runs them in shared environments | None yet: the deploy spec (`specs/003`) decides, likely an App Platform pre-deploy job |
| Lock and statement timeout budget | `lock_timeout` 5 s, `statement_timeout` 60 s |

## Rules

1. A schema change ships its migration in the same PR, and the models match it.
2. Additive and backward compatible: the code deployed now must keep working after the migration runs.
3. Changes to existing things go expand → migrate → contract, in separate releases. The drop is always last, in its own migration.
4. If a change can't be compatible, split it: code first, migration in a later PR marked "needs previous release" in its Risk section.
5. Never edit a migration that is already on `main`; write a new one.
6. One linear history, one head. A fork is fixed by re-parenting your own migration, never with an empty merge revision, and never automatically in CI.
7. `down` is complete and runs in reverse order. Rolling back the app does not roll back the schema; fixes go forward.
8. Large backfills: in batches over the primary key, idempotent, outside one big transaction, with progress logged. Indexes on big tables are created without locking writes, if the database supports it.
9. Data of one tenant or user never becomes visible to another through a migration (policies, grants, defaults).
10. No downgrade against a shared database without a person's explicit confirmation.

## Checks

| Rule | Enforced by |
| --- | --- |
| One head (6) | None yet: `drizzle-kit check` in CI, added by `specs/002` |
| Migrations apply on an empty database with production-like roles (2, 9) | None yet: CI job added by `specs/002` |
| A schema change has a migration (1) | `verify-changes`, `review-code` |
| Compatibility with deployed code (2–4) | `review-code`, the PR's Risk section |

## After merge

Running the migration in each shared environment is an After Merge item unless the pipeline does it, with who runs it and when.
