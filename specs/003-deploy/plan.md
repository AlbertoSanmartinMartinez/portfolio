---
status: draft
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  spec: spec.md
  decisions: ADR-0002 in docs/decisions.md
  pr:
---

# Plan: Deploy to production

## Approach

Build once, deploy the image: a release workflow builds the tag into a container image (Next.js standalone output) and pushes it to GitHub Container Registry, then points the App Platform app at that image tag. The app runs one web service in Frankfurt, a pre-deploy job that applies migrations with Drizzle's runtime migrator, and a dev database. Rollback is the same workflow with an older tag: the image already exists, so nothing is rebuilt. Secrets are set once in App Platform and never sent by the workflow: it reads the live app spec (secrets come back encrypted), changes only the image tag and the version, and applies it.

Rejected: deploying from the branch (App Platform builds branches, not tags, so a rollback would rebuild); DigitalOcean Container Registry (another account and token; GHCR is free for a public repository and pushes with the workflow's own token); drizzle-kit in production (a dev dependency; the runtime migrator needs only `drizzle-orm` and `pg`).

## Interfaces

```
Dockerfile               build stage (pnpm, Node 26, ARG APP_VERSION) → runtime stage (standalone server, drizzle/, scripts/migrate.mjs, non-root user)
next.config.ts           output: "standalone"; headers(): x-app-version + security headers (AC-1, AC-7)
scripts/migrate.mjs      node scripts/migrate.mjs → drizzle-orm migrate() with DATABASE_URL (AC-3)
.do/app.yaml             app "portfolio", region fra; service web (image ghcr.io/albertosanmartinmartinez/portfolio:<tag>, port 3000, health /en);
                         job migrate (PRE_DEPLOY, same image); database db (dev); domain www.albertosanmartinmartinez.es (PRIMARY);
                         alerts DEPLOYMENT_FAILED, DOMAIN_FAILED; envs SITE_URL, DATABASE_URL=${db.DATABASE_URL}, SMTP_* and MAIL_* (secrets set in the console)
.github/workflows/release.yml
  on: release published | workflow_dispatch(tag)
  guard   → actor is a publisher; tag commit is on main (AC-2)
  image   → skip if ghcr.io/…:<tag> exists; else build with APP_VERSION=<tag> and push (AC-1, AC-5)
  deploy  → environment "production" (Alberto approves); doctl: read spec, set image tag, update, wait for ACTIVE (AC-3, AC-4)
  smoke   → curl /es, /en, /en/privacy = 200, /en/nothing = 404, header x-app-version = <tag> (AC-9)
docs/runbooks/deploy.md  one-time setup, release, rollback, what to check
```

## Steps

1. `next.config.ts`: standalone output and the headers; e2e test for the headers on the local production build.
2. `scripts/migrate.mjs` with an integration test against the stack's PostgreSQL (fresh schema).
3. `Dockerfile` and `.dockerignore`, base images pinned by digest; CI's `full` job builds the image and runs it against the service PostgreSQL with a curl smoke.
4. `.do/app.yaml` without secret values.
5. `.github/workflows/release.yml` with pinned actions (`docker/*`, `digitalocean/action-doctl`), minimal permissions (`packages: write` only in the image job), the GitHub environment `production`.
6. Privacy pages name DigitalOcean, Frankfurt (AC-11).
7. `docs/runbooks/deploy.md`, and the guides: releases, ci-cd, environments, config-secrets, migrations ("who runs them": the pre-deploy job).

## Data and migrations

No schema change. Production migrations run in the pre-deploy job; if it fails, App Platform does not deploy (AC-3).

## Risks and rollout

- The dev database has no backups (accepted in the intent); messages also reach Alberto's inbox.
- GoDaddy forwarding of the bare domain over HTTPS is unverified; checked after setup.
- First deploy needs one-time setup by Alberto (After Merge); until then the workflow fails at the guard or the deploy step, never half-way.
- The workflow's DigitalOcean token is scoped to App Platform and stored in the `production` environment, which requires Alberto's approval to run.

## Tests

| Criterion | Test |
| --- | --- |
| AC-1 | CI builds the image with `APP_VERSION` and the container answers `x-app-version`; release smoke checks it in production |
| AC-2 | the guard step (actor list); checked by publishing as Alberto only |
| AC-3 | integration test of `scripts/migrate.mjs`; App Platform's pre-deploy job semantics (documented in the runbook) |
| AC-4 | App Platform health check on `/en` (documented); verified on the first deploy |
| AC-5 | workflow skips the build when the tag's image exists; verified with the first rollback drill |
| AC-6 | runbook checklist after DNS setup (curl of each URL) |
| AC-7 | e2e on the local production build: each header present |
| AC-8 | gitleaks in quality CI; `.do/app.yaml` has no secret values (review) |
| AC-9 | the smoke job itself |
| AC-10 | alerts in `.do/app.yaml` |
| AC-11 | e2e: privacy pages mention DigitalOcean and Frankfurt |

## After merge

- [ ] Create the app once: `doctl apps create --spec .do/app.yaml` (or the console) — Alberto.
- [ ] In App Platform, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO` as encrypted variables (with Google Workspace: `smtp.gmail.com`, port 465, an app password) — Alberto.
- [ ] Create a DigitalOcean token with App Platform scope, the GitHub environment `production` with Alberto as required reviewer, and its secret `DIGITALOCEAN_ACCESS_TOKEN`; set the repository variable `DO_APP_ID` — Alberto.
- [ ] GoDaddy: CNAME `www` → the app's `ondigitalocean.app` host; forward the bare domain to `https://www.albertosanmartinmartinez.es` (301); remove the old A records — Alberto.
- [ ] Publish `v0.1.0` and run the AC-6 checks from the runbook — Alberto.
