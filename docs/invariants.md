# Invariants

Rules that must always hold. Each one names the checks that enforce it under "Enforced by"; `scripts/check_harness.py` fails if a listed path does not exist. A rule without a check is a guideline and belongs in a guide, not here. `review-code` checks the invariants a change touches.

## INV-001: Secrets never reach the repository

- Why: a leaked secret has to be rotated everywhere and stays in Git history.
- Enforced by: `.agents/hooks/scan-secrets.sh`, `.githooks/pre-commit`, `.github/workflows/quality.yml`

## INV-002: The harness has one source

- Why: copies drift; every agent must read the same rules.
- Enforced by: `scripts/check_harness.py`

## INV-003: Nobody pushes directly or force-pushes to the protected branch

- Why: every change to `main` goes through review and CI.
- Enforced by: `.agents/hooks/block-protected-push.sh`, `.githooks/pre-push`, `.agents/hooks/block-unsafe-commands.sh`

## INV-004: Agents open pull requests as drafts and never merge or publish

- Why: a person decides what is ready, what merges and what ships.
- Enforced by: `.agents/hooks/block-unsafe-commands.sh`, `.claude/settings.json`

## INV-005: Harness changes need a person's review

- Why: an agent must not relax its own rules.
- Enforced by: `.github/CODEOWNERS`, `.claude/settings.json`

## INV-006: UI code never reaches the database layer

- Why: pages and components are rendered for every visitor; data access stays in server code that validates and authorizes.
- Enforced by: `eslint.config.mjs`

## INV-007: Content is valid and translated before it ships

- Why: a missing field or language would show a broken page; the build must fail instead.
- Enforced by: `src/content/load.ts`, `tests/unit/content.test.ts`

## INV-008: Contact data never reaches the logs

- Why: names, emails, messages and IP addresses are personal data; logs are kept and shared more widely than the database.
- Enforced by: `tests/unit/contact-service.test.ts`

## INV-009: One consistent migration history

- Why: a fork or a hand-edited snapshot breaks deploys silently.
- Enforced by: `.github/workflows/ci.yml`, `drizzle.config.ts`

## INV-010: The generated client matches the contract

- Why: a stale client compiles and fails at runtime.
- Enforced by: `.github/workflows/ci.yml`, `openapi/openapi.yaml`

## INV-011: Production runs only images built from release tags on main

- Why: what is deployed must be exactly what was reviewed and released, and rollbacks must not rebuild.
- Enforced by: `.github/workflows/release.yml`, `.do/app.yaml`
