---
status: approved
owner: Alberto Sanmartín Martínez
date: 2026-11-25
links:
  intent: intent.md
  tracker: https://linear.app/alberto-sanmartin-martinez/issue/ALB-358
---

# Spec: Portfolio site

## Summary

A public, bilingual (Spanish and English) one-page site that presents Alberto's Profile, Experience and Projects, with links to reach him. Content lives in files taken from his LinkedIn export, one set per language. The contact form is added by `specs/002`.

## Behavior

1. A visitor opens `/`. The site sends them to `/es` or `/en` according to their browser language (Spanish if it prefers Spanish, English otherwise).
2. The page shows, in order: a header with his name and the language switch; the Profile (name, headline, location, short summary, photo); Experience (most recent first); Projects; and a Contact section with links (LinkedIn, GitHub, and email as a `mailto:` link).
3. The header links jump to each section. On a phone the links collapse into a menu.
4. The language switch takes the visitor to the same section in the other language and remembers the choice for later visits.
5. Each Experience entry shows company, role, dates (start–end or "Present"), location and up to five highlights.
6. Each Project shows its name, one-line description, the stack as tags, and links (site, repository) when they exist.
7. Unknown paths show a 404 page in the visitor's language with a link back home.
8. Editing the content files and rebuilding updates the site; no code changes are needed to add an experience or a project.

## Acceptance criteria

- AC-1: Given a browser that prefers Spanish, when the visitor opens `/`, then they land on `/es`; given any other language, they land on `/en`.
- AC-2: Given `/es` or `/en`, then Profile, Experience, Projects and Contact appear in that order, with every visible text in that language.
- AC-3: Given the visitor uses the language switch on a section, then the other language opens at the same section, and opening `/` later goes to the chosen language.
- AC-4: Given the Experience content, then entries are sorted by start date, newest first, and an entry without an end date shows "Actualidad" / "Present".
- AC-5: Given a content file missing a required field or a translation, then the build fails with a message naming the file and field.
- AC-6: Given a Project without links, then it shows no empty link area.
- AC-7: Given an unknown path such as `/en/nothing`, then a 404 page in that language is shown with a link to the home page, and the HTTP status is 404.
- AC-8: Given a 360 px wide screen, then nothing overflows horizontally and the header links are in a menu that opens and closes with the keyboard.
- AC-9: Given keyboard-only use, then every link and control is reachable in reading order with a visible focus, and the menu and language switch have accessible names.
- AC-10: Given each language page, then it has its own title, description, Open Graph image and `hreflang` links to the other language.
- AC-11: Given a production build, then the home pages are statically rendered and score at least 90 in Lighthouse performance and accessibility on mobile.

## UI and UX

One page per language with anchored sections; the existing design system is the one this spec creates: a single typeface, a light and a dark theme that follow the system setting, and one accent color.

| Element | Spanish | English |
| --- | --- | --- |
| Section titles | Sobre mí · Experiencia · Proyectos · Contacto | About · Experience · Projects · Contact |
| Language switch | "English" (accessible name "English — Cambiar a inglés") | "Español" (accessible name "Español — Switch to Spanish") |
| Menu button | `aria-label` "Abrir menú" / "Cerrar menú" | `aria-label` "Open menu" / "Close menu" |
| Current role end date | Actualidad | Present |
| Contact intro | ¿Hablamos? Escríbeme o encuéntrame en: | Let's talk. Write to me or find me on: |
| 404 title and text | Esta página no existe. · Volver al inicio | This page doesn't exist. · Back to home |

States:

- Projects: when there are none, the section and its header link are not shown.
- Experience highlights: when an entry has none, only its header line is shown.
- Photo: if missing, the Profile shows his initials in a circle instead; never a broken image.
- Loading and error states do not apply: pages are static. The 404 page covers unknown paths.

Accessibility: accessible names start with the visible text (WCAG 2.5.3); one `h1` per page (his name), sections as `h2`, `lang` attribute set per page, alt text on the photo, contrast at least 4.5:1 in both themes, no information by color alone, motion reduced when the system asks for it.

## Non-functional

- Privacy: only what Alberto publishes on purpose; no tracking, cookies or third-party scripts. The language choice is stored in a first-party cookie or local storage with no identifier.
- Performance: static rendering, images optimized and sized; covered by AC-11.
- Observability: build logs only; there is no runtime behavior to observe in this spec.
- Security: no user input in this spec; standard security headers are part of `specs/003`.

## Open questions

- [ ] Which projects to feature, and their links: from the LinkedIn export plus any Alberto adds.
- [x] The profile photo: initials for now; a photo can be added to the content later without code changes.
- [x] The public email address: `info@albertosanmartinmartinez.es`, as a `mailto:` link in Contact.
