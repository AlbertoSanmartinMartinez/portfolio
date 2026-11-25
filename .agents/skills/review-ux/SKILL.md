---
name: review-ux
description: Reviews implemented UI against the spec's UI and UX section, checking every state, the copy, accessibility, responsiveness and consistency with the design system, using the browser MCP server on the local stack. Use before marking ready a PR that changes a user-facing surface.
---

# Review UX

## When

A PR changes a screen, a form, an email, a CLI output or the playground. Read-only: report, don't fix.

## Read first

- The spec's "UI and UX" section and acceptance criteria.
- The diff of UI files and the screenshots in the PR evidence.
- The design system or components named in `docs/architecture.md`.

## Steps

1. Start the stack (`run-local-stack`) and open each changed screen with the `browser` MCP server.
2. Walk the flow and force every state the spec lists: empty, loading, each error, success, partial, no permission.
3. Copy: matches the spec word for word, uses glossary terms, errors say what happened and what to do.
4. Accessibility: keyboard-only path, visible focus, labels on inputs and icon buttons, contrast, no information by color alone. Check text in other languages fits, if the product is translated.
5. Layout at a small and a large width.
6. Consistency: existing components and patterns; no one-off styles.
7. Report with screenshots, most severe first: blocking (a state or criterion missing, an inaccessible path), important, minor.

## Done when

- [ ] Every state in the spec was seen, or reported missing.
- [ ] Each finding has the screen, a screenshot and the spec line it breaks.

## Don't

- Don't edit code or the spec.
- Don't report taste as a finding; tie each one to the spec, the design system or an accessibility rule.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
