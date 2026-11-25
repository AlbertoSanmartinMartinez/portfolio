---
status: draft
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  intent: intent.md
  tracker: https://linear.app/alberto-sanmartin-martinez/issue/ALB-359
---

# Spec: Contact form

## Summary

The Contact section gets a form (name, email, message) that sends a Contact message to a small API. The API validates it, drops spam, stores it in PostgreSQL and emails it to Alberto. The visitor sees the result on the page. Messages are deleted after 12 months.

## Behavior

1. The Contact section shows the form above the existing links, with a short privacy notice that links to a privacy page.
2. The visitor fills in name, email and message and presses Send. The browser checks the fields first and shows errors next to each one.
3. While sending, the button is disabled and says it is sending. The form calls `POST /api/v1/contact` through the client generated from `openapi/openapi.yaml`.
4. The API validates the fields again, checks the hidden honeypot field and the per-IP limit, stores the message, deletes messages older than 12 months, and emails the message to Alberto with the sender as reply-to.
5. On success the form is cleared and a thank-you message replaces the button area until the visitor writes again.
6. On a validation error the page shows the server's errors next to the fields; on too many messages or any other failure it shows a message and keeps what the visitor typed.
7. The privacy page explains, in both languages, who receives the data, what for, how long it is kept, and how to ask for access or deletion.

## Acceptance criteria

- AC-1: Given a valid name, email and message, when the visitor sends the form, then the message is stored, Alberto receives an email with the sender as reply-to, the form is cleared and the success message is shown.
- AC-2: Given an empty name, an invalid email, or a message shorter than 10 or longer than 5,000 characters, then the error appears next to that field in the page's language and nothing is stored; the API returns 400 with the same field errors for the same input.
- AC-3: Given the hidden honeypot field is filled, then the API answers exactly as on success but stores and sends nothing.
- AC-4: Given five messages from the same IP address in the last hour, then the sixth gets 429 with `Retry-After`, and the page says to try again later.
- AC-5: Given the email provider fails, then the message is still stored, the visitor still sees the success message, and the failure is logged without the message's content.
- AC-6: While a message is sending, the button is disabled and says "Enviando…" / "Sending…"; given a network or server error, an error message is shown and the typed text is kept.
- AC-7: Given messages older than 12 months, then storing a new message deletes them.
- AC-8: Given keyboard-only or screen-reader use, then every field has a visible label, errors are linked to their fields and announced, and axe finds no violations with the errors shown.
- AC-9: Given the form, then the privacy notice is under it and links to `/es/privacidad` or `/en/privacy`, which exist in both languages and link back to the home page.
- AC-10: Given any request, then logs contain the message id and outcome only, never the name, email, message or IP address.
- AC-11: Given the API, then `openapi/openapi.yaml` describes it, the client in `src/lib/api/schema.d.ts` is generated from it, and CI fails if either drifts or a change breaks the contract.
- AC-12: Given a request whose `Origin` is not the site or a body larger than 10 KB, then the API rejects it without storing anything.

## UI and UX

| Element | Spanish | English |
| --- | --- | --- |
| Field labels | Nombre · Email · Mensaje | Name · Email · Message |
| Button | Enviar · Enviando… | Send · Sending… |
| Success | Gracias, te responderé pronto. | Thanks, I'll get back to you soon. |
| Required field | Este campo es obligatorio. | This field is required. |
| Invalid email | Escribe un email válido. | Enter a valid email address. |
| Message too short / long | Cuéntame un poco más (mínimo 10 caracteres). · El mensaje es demasiado largo (máximo 5.000 caracteres). | Tell me a bit more (at least 10 characters). · The message is too long (5,000 characters at most). |
| Too many messages | Has enviado varios mensajes seguidos. Prueba de nuevo en una hora. | You've sent several messages in a row. Please try again in an hour. |
| Other failure | No se ha podido enviar. Inténtalo de nuevo. | It couldn't be sent. Please try again. |
| Privacy notice | Usaré tus datos solo para responderte y los borraré a los 12 meses. Más información en la [política de privacidad]. | I'll use your details only to reply and delete them after 12 months. More in the [privacy policy]. |
| Privacy page title | Política de privacidad | Privacy policy |

States: idle, sending, success, field errors, rate limited, failure. The honeypot field is visually hidden, out of the tab order and has `autocomplete="off"`. Errors use `aria-invalid` and `aria-describedby`; the status area is an `aria-live="polite"` region. The existing email, LinkedIn and GitHub links stay below the form.

## Non-functional

- Privacy: a Contact message is personal data (`docs/guides/privacy.md`). It is stored only in PostgreSQL, sent only to Alberto's inbox, never logged, never copied out of production, and deleted after 12 months. The IP address is used in memory for the rate limit and never stored.
- Security: input validated on the server; body size and `Origin` checked; the email provider key is a secret; no HTML from the visitor is rendered anywhere.
- Observability: a structured log line per request with outcome and message id; email failures logged with the provider's error code.
- Limits: the rate limit lives in the app's memory, so it is per instance; enough for one App Platform instance.

## Open questions

- [ ] Privacy notice plus a privacy page (recommended), or the notice only.
