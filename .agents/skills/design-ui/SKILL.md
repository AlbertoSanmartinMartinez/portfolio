---
name: design-ui
description: Designs the UI part of a spec: flows, every state (empty, loading, error, success, partial), exact copy and accessibility, using the project's existing components. Use when a spec touches a screen or any user-facing surface.
---

# Design the UI

## When

A spec changes something a user sees or operates: a screen, a form, an email, a CLI output, the playground. Run it while writing the spec, before the plan.

## Read first

- The spec's behavior and acceptance criteria.
- The existing UI the change touches (code, screenshots from `browser` on the local stack) and the design system or component library named in `docs/architecture.md`.
- `docs/glossary.md`: the copy uses the same terms as the product.

## Steps

1. Map the flow: entry point, steps, exit points, and where the user can go back or cancel.
2. For each screen or surface, define every state: empty, loading, error (each error the spec names), success, partial or stale data, no permission.
3. Write the exact copy for titles, buttons, messages and errors. Short, specific, in the product's terms; errors say what happened and what to do.
4. Reuse existing components; name them. A new component needs a reason in the spec.
5. Accessibility: keyboard path, focus order, labels for inputs and icons, contrast, motion. Add an acceptance criterion when it is testable.
6. Responsive behavior if the product runs on small screens.
7. Write it all in the spec's "UI and UX" section, one subsection per screen. Add acceptance criteria for states that must be tested.

## Done when

- [ ] Every screen in the flow has all its states and their copy.
- [ ] Components are named; new ones are justified.
- [ ] Accessibility notes exist and testable ones are acceptance criteria.

## Don't

- Don't design states the spec doesn't need, or new visual styles outside the design system.
- Don't leave copy as "TBD" or lorem ipsum.
- Don't implement; this goes into the spec.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
