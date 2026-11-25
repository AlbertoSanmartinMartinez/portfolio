# Feature flags

How unfinished or risky work merges to `main` without being switched on. Skill: `add-feature-flag`.

## Project facts

| Fact | Value |
| --- | --- |
| Flag mechanism | Environment variables `FLAG_<NAME>`, read through `src/flags.ts` |
| Where flags are declared | `src/flags.ts` (created with the first flag) |

## Rules

1. Work that isn't finished merges behind a flag that is off by default.
2. Each flag is declared once in the registry with its owner, purpose and removal date.
3. Code reads flags through one module; no scattered environment lookups.
4. Tests cover the flag on and off.
5. Turning a flag on in an environment is a deliberate change with an owner, usually an After Merge item.
6. Removing the flag and the dead branch is a tracker item created with the flag. Expired flags are a review finding.
7. Flags are not configuration: no secrets, no per-customer settings behind them.

## Checks

| Rule | Enforced by |
| --- | --- |
| Flags declared with an owner and date (2) | The registry; `review-code` reports expired ones |
| Both states tested (4) | `write-tests`, `review-code` |
