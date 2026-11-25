---
name: write-spec
description: Turns an approved intent into specs/<NNN>-<slug>/spec.md with behavior, numbered testable acceptance criteria and UI states, then asks a person to approve it. Use after write-intent and before any plan or code.
---

# Write the spec

## When

`intent.md` exists and the person agrees with it. Step 2 of the flow. A spec that changes after approval goes through this skill again.

## Read first

- `specs/<NNN>-<slug>/intent.md`.
- `docs/templates/spec.md`: the format.
- `docs/glossary.md`: every domain word in the spec comes from here.
- `docs/architecture.md` and existing specs that touch the same area, to avoid contradicting them.
- `docs/invariants.md`: the spec must not require breaking one.

## Steps

1. Copy the template to `specs/<NNN>-<slug>/spec.md` and link the intent.
2. Write the behavior as a user or caller sees it, step by step. No tables, columns or classes.
3. Write the acceptance criteria as `AC-n: Given …, when …, then …`. Each one is testable by a person or a test, and covers one behavior. Include the error and edge cases.
4. If there is UI, call `design-ui` for the "UI and UX" section (states and copy).
5. Fill "Non-functional" only with expectations that apply (performance, privacy, observability).
6. New terms: add them to `docs/glossary.md` in the same change.
7. Put anything undecided under "Open questions". A spec with open questions that change behavior is not ready.
8. Ask the person to approve it. When they do, set `status: approved`. Until then, no `write-plan`.

## Done when

- [ ] Every outcome in the intent maps to at least one acceptance criterion.
- [ ] Every acceptance criterion is testable and numbered.
- [ ] Terms match the glossary; new ones are added.
- [ ] A person approved it and the frontmatter says `approved`.

## Don't

- Don't describe the implementation (that is `plan.md`).
- Don't write vague criteria ("fast", "user-friendly") without a measure.
- Don't mark it approved yourself.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
