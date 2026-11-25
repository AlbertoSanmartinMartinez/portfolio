---
status: draft
owner: Alberto Sanmartín Martínez
date: 2026-11-25
---

# Runbook: deploy to production

How the site gets to https://www.albertosanmartinmartinez.es (`specs/003-deploy/`). Releases are built once by `.github/workflows/release.yml` into `ghcr.io/albertosanmartinmartinez/portfolio:vX.Y.Z` and deployed to DigitalOcean App Platform (`.do/app.yaml`).

## When to use it

The first deploy (one-time setup), every release, a rollback, and after DNS changes.

## Before you start

- `doctl` logged in with your DigitalOcean account; access to GoDaddy DNS and to the repository settings.
- Never paste tokens or passwords into the repository, issues or chats; they go only into the consoles named below.

## One-time setup

1. **First image.** Merge to `main`, then publish a GitHub release `v0.1.0`. The workflow builds and pushes the image; the deploy job waits for your approval in the `production` environment — reject it this first time (there is no app yet). In GitHub → Packages → `portfolio`, check the package is public (App Platform pulls it without credentials).
2. **App.** `doctl apps create --spec .do/app.yaml`. If the region is refused, check the slug with `doctl apps list-regions` (Frankfurt is expected to be `fra`). Note the app id.
3. **Variables in App Platform** (Settings → App-level environment variables, encrypted): `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=info@albertosanmartinmartinez.es`, `SMTP_PASSWORD` = a Google app password for that account, `MAIL_FROM` and `MAIL_TO` = `info@albertosanmartinmartinez.es`.
4. **GitHub.** Environment `production` with you as required reviewer; in it, the secret `DIGITALOCEAN_ACCESS_TOKEN` (a token limited to App Platform read and update). Repository variable `DO_APP_ID` = the app id. Optional variable `RELEASE_PUBLISHERS` (space-separated GitHub users; default `AlbertoSanmartinMartinez`).
5. **DNS at GoDaddy** (email records stay as they are):
   - Delete the old `A` record of `@` (34.245.221.43) and the old `www` record.
   - `CNAME` `www` → the `…ondigitalocean.app` host shown in App Platform → Networking → Domains.
   - Forwarding: `albertosanmartinmartinez.es` → `https://www.albertosanmartinmartinez.es`, permanent (301).
6. **Deploy.** Actions → `release` → Run workflow with `v0.1.0`. The image is reused; approve `production`.
7. **Check** with the list below.

## Release

1. `main` is green; `prepare-release` gave you the checklist and notes.
2. Publish the GitHub release `vX.Y.Z` (from `main`) with its notes.
3. Approve the `production` deployment when it asks. The workflow applies migrations (pre-deploy job), switches traffic and runs the smoke check; it fails if the site doesn't serve `vX.Y.Z`.

## Roll back

Actions → `release` → Run workflow with the previous tag, approve `production`. The image is reused, nothing is rebuilt. Migrations are not reverted: if the previous version can't run on the current schema, fix forward instead.

## Verify

```bash
curl -sI https://www.albertosanmartinmartinez.es/en | grep -i -E 'x-app-version|strict-transport|x-frame'
curl -sI http://www.albertosanmartinmartinez.es/en | head -3        # redirects to https
curl -sI http://albertosanmartinmartinez.es/ | head -3              # forwards to https://www
curl -sI https://albertosanmartinmartinez.es/ | head -3             # GoDaddy forwarding over HTTPS: record the result
dig +short MX albertosanmartinmartinez.es                           # Google records still there
```

On the first deploy, also confirm in App Platform → Activity that the `migrate` job ran before the web component, and note what App Platform does when a deploy fails (AC-3 and AC-4 of `specs/003`; DigitalOcean doesn't document it). Update this runbook with what you see.

## Roll back the setup

Delete the app in App Platform (this deletes the dev database and its messages) and restore the GoDaddy records you removed.
