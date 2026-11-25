---
name: run-local-stack
description: Starts, inspects, seeds, debugs and stops this worktree's Docker Compose stack with scripts/stack.sh. Use when you need the app, the API or the database running locally, or when the stack does not start.
---

# Run the local stack

## When

Before e2e tests, before trying a change in the browser, before using the `db-local` MCP server, or when `scripts/stack.sh up` fails. Orca runs `up` when it creates a worktree and `down` when it archives it.

## Read first

- `scripts/stack.sh` (usage at the top) and `compose.yaml`.
- `docs/environments.md` (local row) and `docs/guides/testing.md` (seed data).

## Steps

1. Start it: `scripts/stack.sh up`. The Compose project name comes from the worktree folder, so other worktrees' stacks are untouched.
2. Get the URLs and ports: `scripts/stack.sh info`. Host ports are dynamic; never assume a fixed port.
3. Load synthetic data and test accounts: `scripts/stack.sh seed`. It is idempotent.
4. If a service fails:
   - `scripts/stack.sh logs <service>` and read the first error, not the last line.
   - Check Docker itself: `docker info` (daemon up, disk space).
   - A port clash or a stale volume: `scripts/stack.sh down` and `up` again. `down` only removes this worktree's containers and volumes.
5. Point tools at it: export `DB_LOCAL_DSN` from `info` for the `db-local` MCP server; use the app URL from `info` for `browser`.
6. Stop it when you finish: `scripts/stack.sh down`.

## Done when

- [ ] `scripts/stack.sh info` shows every service healthy, with its URL.
- [ ] Seed data is loaded if tests or e2e need it.

## Don't

- Don't run `docker compose` without `-p`, or `docker system prune`: they hit other worktrees' stacks.
- Don't point the local stack at shared databases or real third-party accounts.
- Don't copy production data into it.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
