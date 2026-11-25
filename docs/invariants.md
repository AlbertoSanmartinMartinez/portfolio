# Invariants

Rules that must always hold. Each one names the checks that enforce it under "Enforced by"; `scripts/check_harness.py` fails if a listed path does not exist. A rule without a check is a guideline and belongs in a guide, not here. `review-code` checks the invariants a change touches.

## INV-001: Secrets never reach the repository

- Why: a leaked secret has to be rotated everywhere and stays in Git history.
- Enforced by: `.agents/hooks/scan-secrets.sh`, `.githooks/pre-commit`, `.github/workflows/quality.yml`, `.gitlab-ci.yml`

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
- Enforced by: `.github/CODEOWNERS`, `.gitlab/CODEOWNERS`, `.claude/settings.json`

TODO(adopt): project invariants (architecture boundaries, tenancy, generated code, migrations…), each with its check.
