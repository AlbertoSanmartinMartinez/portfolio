#!/usr/bin/env bash
# Synthetic data for the local stack. Idempotent. Never real personal data
# (docs/guides/privacy.md). Called by `scripts/stack.sh seed` with STACK_PROJECT set.
# Run `pnpm db:migrate` first so the tables exist.
set -euo pipefail
: "${STACK_PROJECT:?run it through scripts/stack.sh seed}"

docker compose -p "$STACK_PROJECT" -f compose.yaml exec -T db psql -v ON_ERROR_STOP=1 -q -U app -d app <<'SQL'
INSERT INTO contact_message (id, name, email, message, locale) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Ada Example', 'ada@example.test', 'Synthetic message to try the local stack.', 'en'),
  ('00000000-0000-4000-8000-000000000002', 'Lola Ejemplo', 'lola@example.test', 'Mensaje sintético para probar el stack local.', 'es')
ON CONFLICT (id) DO NOTHING;
SQL
echo "seed: 2 synthetic contact messages"
