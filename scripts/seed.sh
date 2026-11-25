#!/usr/bin/env bash
# Synthetic data and test accounts for the local stack. Idempotent: running it twice
# leaves the same data. Never put real personal data here (docs/guides/privacy.md).
# Called by `scripts/stack.sh seed` with STACK_PROJECT set. Adapt it to the project.
set -euo pipefail
: "${STACK_PROJECT:?run it through scripts/stack.sh seed}"

docker compose -p "$STACK_PROJECT" -f compose.yaml exec -T db psql -v ON_ERROR_STOP=1 -U app -d app <<'SQL'
CREATE TABLE IF NOT EXISTS example_account (
  id    integer PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role  text NOT NULL
);
INSERT INTO example_account (id, email, role) VALUES
  (1, 'admin@example.test', 'admin'),
  (2, 'user@example.test',  'user')
ON CONFLICT (id) DO NOTHING;
SQL
echo "seed: example accounts admin@example.test and user@example.test"
