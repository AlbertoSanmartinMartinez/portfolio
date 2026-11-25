---
status: approved
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  intent: intent.md
  tracker: https://linear.app/alberto-sanmartin-martinez/issue/ALB-360
---

# Spec: Deploy to production

## Summary

A release workflow builds the tagged version once, runs its migrations against the production database, and deploys it to DigitalOcean App Platform (Frankfurt) with an App Platform dev database. The site answers on https://www.albertosanmartinmartinez.es; GoDaddy forwards the bare domain there and App Platform redirects plain HTTP. A read-only smoke check runs after every deploy. Rolling back redeploys the previous tag.

## Behavior

1. Alberto publishes a GitHub release `vX.Y.Z` on a commit of `main` whose CI is green.
2. The release workflow checks that the person who published it is an allowed publisher, then builds that tag into a container image tagged `vX.Y.Z`.
3. It deploys the image to App Platform. Before the new version receives traffic, a job runs the migrations; if they fail, the deploy stops and the current version keeps serving.
4. App Platform health-checks the new version and only then switches traffic; a failing version never replaces a healthy one.
5. A smoke check reads the home pages, a 404 and a privacy page, and confirms the served version is `vX.Y.Z`. It never sends the contact form.
6. To roll back, Alberto runs the same workflow with an earlier tag; it deploys that image without rebuilding it.
7. App Platform emails Alberto when a deploy or the domain fails.

## Acceptance criteria

- AC-1: Given a release `vX.Y.Z` published by an allowed publisher, then that tag is built once and deployed, and https://www.albertosanmartinmartinez.es answers with header `x-app-version: vX.Y.Z`.
- AC-2: Given a release published by anyone else, then the workflow fails before building or deploying anything.
- AC-3: Given a migration that fails, then the deploy stops and the previous version keeps serving.
- AC-4: Given a new version that fails its health check, then App Platform keeps the previous version serving.
- AC-5: Given the workflow run by hand with an earlier tag, then that tag's existing image is deployed without a new build.
- AC-6: Given `http://www.albertosanmartinmartinez.es` or `http://albertosanmartinmartinez.es`, then the visitor ends on `https://www.albertosanmartinmartinez.es` with a valid certificate. Whether `https://albertosanmartinmartinez.es` also redirects depends on GoDaddy's forwarding and is checked after setup.
- AC-7: Given any response, then it carries `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a `Permissions-Policy` that turns off camera, microphone and geolocation.
- AC-8: Given the repository, then it holds no secret values: the database URL, SMTP credentials and the DigitalOcean token live only in App Platform and GitHub secrets, and gitleaks finds nothing.
- AC-9: Given a finished deploy, then the smoke check passes on `/es`, `/en`, `/en/privacy` and a 404, read-only, or the workflow fails and says so.
- AC-10: Given a failed deploy or domain problem, then Alberto gets an email from App Platform.
- AC-11: Given the privacy page, then it names DigitalOcean (Frankfurt, EU) as the hosting provider.

## UI and UX

No new screens. The privacy pages name the hosting provider and region (AC-11).

## Non-functional

- Security: only Alberto can publish; the DigitalOcean token is scoped to the app and lives in a GitHub environment that requires his approval; images and actions are pinned.
- Reliability: the dev database has no backups (accepted risk, see intent); deploys never take the site down on failure (AC-3, AC-4).
- Privacy: production data stays in DigitalOcean Frankfurt and Alberto's inbox; it is never copied elsewhere.
- Cost: one basic App Platform service, one dev database and the container registry's starter tier.

## Open questions

- [x] DNS stays at GoDaddy; `www` is canonical and the bare domain is forwarded (Alberto, 2026-11-25).
- [ ] Whether GoDaddy's forwarding serves `https://albertosanmartinmartinez.es` with a valid certificate; if not, document it as a known limit.
