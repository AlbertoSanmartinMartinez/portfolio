---
status: approved
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  tracker: https://linear.app/alberto-sanmartin-martinez/issue/ALB-360
---

# Intent: Deploy to production

## Problem

The site and the contact form only run on Alberto's machine. Nobody can visit them, and there is no safe, repeatable way to ship a new version or go back to the previous one.

## Users

- Visitors, who reach the site at https://www.albertosanmartinmartinez.es.
- Alberto, who publishes releases and must be able to roll back without help.

## Outcome

Publishing a release `vX.Y.Z` puts exactly that version on https://www.albertosanmartinmartinez.es, served from DigitalOcean App Platform in Frankfurt with its database, after its migrations run. Going back is one action with the previous tag. Secrets never touch the repository.

## Out of scope

- Staging or preview environments.
- Database backups: the App Platform dev database has none; Alberto accepts that risk (messages also reach his inbox).
- Analytics, CDN tuning, a status page.

## Open questions

- [x] DNS stays at GoDaddy, so the email records (Google Workspace MX, SPF) stay untouched. GoDaddy can't point the bare domain at App Platform, so `www` is the canonical address and GoDaddy forwards the bare domain to it (Alberto, 2026-11-25).
