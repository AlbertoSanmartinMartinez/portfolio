#!/usr/bin/env bash
# Synthetic data for the local stack. Idempotent. Never real personal data
# (docs/guides/privacy.md). Called by `scripts/stack.sh seed` with STACK_PROJECT set.
# specs/002 adds synthetic contact messages once the table exists.
set -euo pipefail
: "${STACK_PROJECT:?run it through scripts/stack.sh seed}"
echo "seed: no seed data yet"
