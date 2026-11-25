# Environments

What exists, how to get in and what e2e tests may do in each. Test accounts and tokens come from environment variables; their names are listed here, never their values.

| Environment | URL | Access | Data | E2E allowed |
| --- | --- | --- | --- | --- |
| local | `scripts/stack.sh info` | Seeded accounts (`scripts/stack.sh seed`) | Synthetic | Everything |
| dev | None | — | — | — |
| stage | None | — | — | — |
| prod | None yet: DigitalOcean App Platform (`specs/003`) | Public site; no accounts | Real | Read-only smoke, with Alberto's explicit OK; never send the contact form |

Rules:

- Never copy production data to local, dev or stage.
- In prod, e2e tests only read: no sign-ups, writes, payments or emails to real people.
- The `browser` MCP server may open any URL in this table; `db-local` only reaches the local stack.
- The "playground" is the product's interactive surface (API explorer, agent playground…); e2e tests exercise it like the UI.
