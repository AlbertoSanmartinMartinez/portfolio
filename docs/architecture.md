# Architecture

The map agents and people open first. Keep it short and current: `write-plan` updates it when the structure changes. Parts marked *planned* don't exist yet; the spec named next to them builds them.

## Overview

A Next.js app (App Router) renders the portfolio pages from content files and serves a small contact API (`/api/v1/contact`) that stores messages in PostgreSQL through Drizzle. The contact form calls the API through a client generated from `openapi/openapi.yaml`. Production runs on DigitalOcean App Platform with a managed PostgreSQL database.

## Components

| Component | Path | Responsibility | Talks to |
| --- | --- | --- | --- |
| Pages and UI | `src/app/[lang]/`, `src/components/` | Profile, experience, projects, contact links, localized 404 | Content, dictionaries |
| Content | `content/<lang>/*.json`, validated by `src/content/` | Profile, experience and projects per language | — |
| Languages | `src/i18n/`, `src/proxy.ts` | Locale choice (cookie, then browser), UI copy per language | — |
| Contact API (*planned*, `specs/002`) | `src/app/api/v1/contact/` | Validates and stores contact messages | Database |
| Database access (*planned*, `specs/002`) | `src/db/` | Drizzle schema and queries | PostgreSQL |
| Generated API client (*planned*, `specs/002`) | `src/lib/api/schema.d.ts` | Types for calling the contact API | — |

## Boundaries

UI components never import `src/db/`; only server code (route handlers) does. Enforced by ESLint `no-restricted-imports` in `eslint.config.mjs` (INV-006).

## Main flows

1. A visitor opens `/`: `src/proxy.ts` redirects to `/es` or `/en`; the page is prerendered at build time from `content/<lang>/`.
2. A visitor sends the contact form: the form calls `POST /api/v1/contact` through the generated client; the API validates, stores the message and answers with its id.

## Where things live

| Kind of thing | Path |
| --- | --- |
| Feature specs | `specs/` |
| API contract | `openapi/openapi.yaml` |
| Generated code | `src/lib/api/schema.d.ts` |
| Migrations | `drizzle/` |
| Tests | `tests/unit/`, `tests/integration/`, `tests/e2e/` |
