---
name: add-config-variable
description: Adds a configuration setting or secret end to end — schema with validation, .env.example entry, per-environment documentation and an After Merge item to set it — without the value ever entering the repo or the model's context. Use when code needs a new setting or credential.
---

# Add a config variable

## When

The code needs a new setting, feature toggle value, URL or credential.

## Read first

- `docs/guides/config-secrets.md`: where config is validated and where secrets live.
- `docs/environments.md`.

## Steps

1. Name it in the project's style; describe what it controls and its default, if a safe default exists. Secrets have no default.
2. Add it to the config schema with validation, so the app refuses to start without a valid value.
3. Add it to `.env.example` with a one-line comment and no value.
4. Read it in one place and pass the value to where it is needed; secrets only reach the client that uses them, never prompts, logs or tool output.
5. Per-environment values: note them in `docs/environments.md` (names, not values).
6. After Merge: one item per environment to set it, with who does it and in which store.
7. Tests: valid, missing and invalid values.

## Done when

- [ ] Schema, `.env.example`, docs and tests are updated in the same PR.
- [ ] After Merge lists where the value must be set.

## Don't

- Don't write values, even example secrets that look real, anywhere in the repo or the PR.
- Don't read `.env` files or ask the person to paste a secret into the conversation.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
