# Configuration and secrets

How settings reach the code, and where secrets live. Skill: `add-config-variable`.

## Project facts

| Fact | Value |
| --- | --- |
| Where config is defined and validated | `src/env.ts`, a schema validated at build and startup |
| Secret store for CI/CD | GitHub Actions secrets |
| Secret store per environment | DigitalOcean App Platform encrypted environment variables |
| Who sets secrets | Alberto |

## Rules

1. Configuration comes from environment variables, validated by one schema at startup; the app refuses to start with missing or invalid values.
2. `.env.example` lists every variable the app reads, with a comment and no value.
3. Secrets live only in the secret stores above. Never in the repo, issues, PR bodies, logs, traces, prompts or the model's context.
4. Code reads secrets at the edge (the client that uses them) and never passes them through prompts or tool output.
5. A new variable updates, in the same PR: the schema, `.env.example`, `docs/environments.md` if it differs per environment, and an After Merge item to set it in each environment.
6. Prefer short-lived credentials (OIDC, workload identity) over static keys.
7. A leaked secret is rotated immediately, then removed from history if needed; the incident is recorded.

## Checks

| Rule | Enforced by |
| --- | --- |
| No secrets in commits (3) | `.agents/hooks/scan-secrets.sh`, gitleaks in `.github/workflows/quality.yml` and `.gitlab-ci.yml` |
| Agents can't read local secret files (3) | `deny` of `Read(**/.env)` in `.claude/settings.json` |
| Every variable is in `.env.example` (2) | `tests/unit/env.test.ts` |
