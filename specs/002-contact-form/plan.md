---
status: approved
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  spec: spec.md
  decisions: ADR-0002 in docs/decisions.md
  pr:
---

# Plan: Contact form

## Approach

A route handler `POST /api/v1/contact` calls a small service with ports for storage, mail, rate limit and logging, so the rules are unit-tested with fakes and the adapters with real PostgreSQL and SMTP. Storage is Drizzle on PostgreSQL; mail goes through the SMTP server of Alberto's domain with Nodemailer; locally the stack runs Mailpit as the SMTP server, so e2e tests read the delivered email. The contract lives in `openapi/openapi.yaml`; openapi-typescript generates the types and openapi-fetch makes the typed call from the form. Validation rules (lengths, required fields) live in one module used by the server schema and the client checks.

Rejected: Server Actions (no versioned contract to test the generated-client guide), a rate-limit table (stores IP data; memory is enough for one instance), zod in the browser (bundle size for three fields).

## Interfaces

```ts
// openapi/openapi.yaml — POST /api/v1/contact
ContactRequest  { name: string(1..100); email: string(email, ..254); message: string(10..5000); locale: "es" | "en"; website?: string }  // website = honeypot
201 { id: uuid } · 400 { error: "validation"; fields: Partial<Record<"name"|"email"|"message", "required"|"invalid_email"|"too_short"|"too_long">> }
403 { error: "forbidden_origin" } · 413 { error: "too_large" } · 429 { error: "rate_limited" } + Retry-After · 500 { error: "internal" }

// src/contact/rules.ts — shared limits and validateContact(input): FieldErrors
// src/contact/service.ts
type Ports = { store: ContactStore; mailer: Mailer; limiter: RateLimiter; log: Logger; now: () => Date };
submitContact(input: ContactRequest, ip: string, ports: Ports): Promise<{ status: 201; id } | { status: 400; fields } | { status: 429; retryAfter }>
interface ContactStore { insert(msg): Promise<{ id }>; deleteOlderThan(date): Promise<number> }
interface Mailer { send(msg: { id; name; email; message; locale }): Promise<void> }   // reply-to = sender
interface RateLimiter { hit(key: string, now: Date): { allowed: boolean; retryAfter: number } }  // 5 per hour, in memory

// src/db/schema.ts — contact_message(id uuid pk default gen_random_uuid(), name text, email text, message text, locale text, created_at timestamptz default now()), index on created_at
// src/env.ts — readServerEnv(): DATABASE_URL, SMTP_HOST, SMTP_PORT, SMTP_USER?, SMTP_PASSWORD?, MAIL_FROM, MAIL_TO
```

UI: `ContactForm` (client component) in the Contact section; pages `src/app/[lang]/privacidad/page.tsx` (es) and `src/app/[lang]/privacy/page.tsx` (en), each a 404 in the other language.

## Steps

1. Dependencies (`add-dependency`): drizzle-orm, postgres, nodemailer, openapi-fetch; dev: drizzle-kit, openapi-typescript, @types/nodemailer. Exact versions older than the 7-day quarantine.
2. Local stack: Mailpit service in `compose.yaml` (pinned digest); `scripts/stack.sh info` prints `DATABASE_URL` and the SMTP settings; `scripts/seed.sh` inserts synthetic messages.
3. `create-migration`: `src/db/schema.ts`, `drizzle.config.ts`, the first migration in `drizzle/`, `pnpm db:migrate`.
4. `update-api-contract` and `generate-client`: `openapi/openapi.yaml`, `pnpm api:generate` → `src/lib/api/schema.d.ts`, the typed client.
5. Service, rules, rate limiter and adapters, with unit tests on fakes first.
6. Route handler with `Origin` and size checks; integration tests against the stack's PostgreSQL and Mailpit.
7. `add-config-variable` for the server variables; `.env.example` and the env test.
8. `ContactForm` and its states with the dictionary copy; the privacy pages.
9. E2E for the form states, the email in Mailpit, axe with errors shown, and the privacy pages.
10. CI: PostgreSQL and Mailpit services in the full job, `drizzle-kit check` and migrate, client drift check, oasdiff against `main`.
11. Harness: Commands table, architecture, invariants (contact data never logged; one migration history; generated client matches the contract), and the guides' "None yet" rows this spec resolves.

## Data and migrations

One additive migration creating `contact_message` and its index. Compatible with the deployed code (nothing reads it yet). Revert: a forward migration dropping the table, only if the feature is removed. Running it in production is `specs/003`.

## Risks and rollout

- SMTP credentials or DNS (SPF, DKIM) wrong in production: the message is stored anyway (AC-5) and the error is logged; checked in the deploy spec.
- Spam beyond the honeypot: the rate limit caps it per instance; Turnstile can come later behind a flag.
- The privacy text is not legal advice: Alberto reviews it before release.

## Tests

| Criterion | Test |
| --- | --- |
| AC-1 | unit (service stores and mails); integration (route → PostgreSQL and Mailpit); e2e (form → success, email in Mailpit with reply-to) |
| AC-2 | unit (rules); integration (400 with field codes); e2e (errors next to fields, nothing stored) |
| AC-3 | unit and integration (honeypot → 201, nothing stored or sent) |
| AC-4 | unit (limiter); integration (sixth request → 429 with Retry-After); e2e (message shown) |
| AC-5 | unit (mailer fails → stored, 201, logged without content) |
| AC-6 | e2e (button state while sending; server error keeps the text) |
| AC-7 | unit and integration (old rows deleted on insert) |
| AC-8 | e2e (labels, aria-invalid/aria-describedby, live region, axe with errors shown) |
| AC-9 | e2e (notice link and both privacy pages) |
| AC-10 | unit (captured log lines contain no name, email, message or IP) |
| AC-11 | CI (regenerate and `git diff --exit-code`; oasdiff breaking against `main`) |
| AC-12 | integration (foreign `Origin` → 403; 11 KB body → 413; nothing stored) |

## After merge

- [ ] Set `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` and `MAIL_TO` in production — Alberto, with `specs/003`.
- [ ] Check SPF and DKIM of the sending domain so the emails don't land in spam — Alberto.
- [ ] Review the privacy page text — Alberto.
