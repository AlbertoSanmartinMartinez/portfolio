---
status: approved
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  spec: spec.md
  decisions: ADR-0002 in docs/decisions.md
  pr:
---

# Plan: Portfolio site

## Approach

A Next.js 16 App Router app with a `[lang]` route segment (`es`, `en`) and statically generated pages. Content lives in JSON files per language, validated by a zod schema at build time, so a bad or missing translation fails the build (AC-5). UI copy lives in two small dictionaries. Styling with CSS Modules and CSS variables for the light and dark themes: no CSS framework, fewer dependencies. Language choice: a proxy (Next 16's middleware) reads a first-party `lang` cookie, then `Accept-Language`.

Rejected: an i18n library (two locales and static content don't need one); Tailwind (another dependency and build step for a one-page site); MDX content (JSON validates field by field and maps cleanly from the LinkedIn export).

## Interfaces

```ts
// src/i18n/config.ts
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function pickLocale(cookie: string | undefined, acceptLanguage: string | null): Locale;

// src/i18n/dictionaries.ts — UI copy from the spec table
export function getDictionary(lang: Locale): Dictionary;

// src/content/schema.ts (zod)
Profile    { name; headline; location; summary: string[]; photo?: string; links: { linkedin; github; email } }
Experience { company; role; location?; start: "YYYY-MM"; end?: "YYYY-MM"; highlights: string[] (max 5) }
Project    { name; description; stack: string[]; links?: { site?; repo? } }

// src/content/load.ts
export function getContent(lang: Locale): { profile: Profile; experience: Experience[]; projects: Project[] };
// Validates content/<lang>/{profile,experience,projects}.json; throws "content/<lang>/<file>.json: <field>: <problem>".
// Checks both languages have the same experiences and projects (by id). Sorts experience by start, newest first.

// src/env.ts
export const env: { SITE_URL: string };   // validated at build; listed in .env.example
```

Routes: `/` (proxy redirect), `/[lang]` (home), `/[lang]/opengraph-image` (generated OG image), not-found per language. Components: `Header` (anchors, menu button, language switch), `Profile` (with `Initials` fallback), `Experience`, `Projects`, `Contact`.

## Steps

1. Scaffold with `create-next-app@16.4.6` (TypeScript, App Router, `src/`, ESLint, no Tailwind), pnpm 12.19.0, Node 26 LTS. Pin every dependency exactly; `pnpm-workspace.yaml` with `minimumReleaseAge: 4320`.
2. Lint and format: ESLint flat config from `eslint-config-next` plus `no-restricted-imports` so `src/components/**` and `src/app/**` client code never import `src/db/**`; Prettier.
3. `src/env.ts` and `.env.example` (`SITE_URL`), with a unit test that every schema variable is in `.env.example`.
4. i18n config, dictionaries and the proxy (AC-1, AC-3).
5. Content schema and loader with unit tests (AC-4, AC-5), then the content files from Alberto's LinkedIn export, translated to the other language; Alberto reviews the text.
6. Layout, theme and components, the 404 pages, metadata with `hreflang` and the OG image (AC-2, AC-6–AC-10).
7. Tests: Vitest unit tests, Playwright e2e per criterion with an axe check, Lighthouse CI on the production build (AC-11).
8. CI `.github/workflows/ci.yml`: drafts run install (`--frozen-lockfile`), lint, types and unit tests; ready PRs and `main` add build, e2e, Lighthouse and diff coverage (80% of changed lines); `ci-ok` aggregates. `.github/dependabot.yml` for npm and actions.
9. Harness updates: Commands table in `AGENTS.md`, `docs/architecture.md`, invariants INV-006 (UI never imports the database layer, enforced by the ESLint config) and INV-007 (content is validated, enforced by the schema test).

## Data and migrations

None: no database in this spec.

## Risks and rollout

- LinkedIn text may be long or only in one language: the schema limits highlights to five, and Alberto reviews the translations before merge.
- Lighthouse scores vary on CI runners: three runs, median, threshold 90.
- TypeScript: use the version `create-next-app@16.4.6` installs, pinned exactly.
- Rollout: nothing is deployed until `specs/003`; rollback is reverting the PR.

## Tests

| Criterion | Test |
| --- | --- |
| AC-1 | e2e: `/` with `Accept-Language: es-ES` → `/es`; with `de-DE` → `/en`; unit: `pickLocale` |
| AC-2 | e2e: section order and `lang` attribute per language |
| AC-3 | e2e: switch keeps the section anchor; cookie makes `/` go to the chosen language |
| AC-4 | unit: loader sorts by start date; missing end shows "Actualidad"/"Present" (e2e) |
| AC-5 | unit: missing field and missing translation fail with file and field in the message |
| AC-6 | e2e: a project without links renders no link list |
| AC-7 | e2e: `/en/nothing` returns 404 with the localized page |
| AC-8 | e2e at 360 px: no horizontal overflow; menu opens and closes with Enter and Escape |
| AC-9 | e2e: keyboard tab order and visible focus; axe finds no violations |
| AC-10 | e2e: title, description, Open Graph and `hreflang` per language |
| AC-11 | Lighthouse CI on the production build, mobile, performance and accessibility ≥ 90 |

## After merge

- [ ] Add `ci-ok` to the required checks of `main` — Alberto (GitHub settings).
- [ ] Review the Spanish and English text of the content files — Alberto.
