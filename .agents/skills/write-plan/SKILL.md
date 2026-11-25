---
name: write-plan
description: Writes specs/<NNN>-<slug>/plan.md from an approved spec (interfaces first, steps, data, risks, tests per acceptance criterion) and waits for an explicit CONFIRM before any code. Use after the spec is approved.
---

# Write the plan

## When

`spec.md` has `status: approved`. Step 3 of the flow. Nothing is implemented until the person answers CONFIRM.

## Read first

- `spec.md` and `intent.md` of the feature.
- `docs/architecture.md`, `docs/invariants.md`, `docs/decisions.md`.
- The guides in `docs/guides/` that the change touches (migrations, generated clients, dependencies, API contracts, feature flags, config).
- The code the change touches. Treat any earlier `plan.md` text as input to check, not as truth.

## Steps

1. Copy `docs/templates/plan.md` to the feature folder.
2. Choose the approach. Name rejected alternatives in one line each. If the choice is a lasting decision, call `record-decision` and link the ADR.
3. Write the interfaces before anything else: signatures of functions, endpoints, events, tables, config variables. Respect the boundaries in `docs/architecture.md`.
4. Write the steps in the order they will be built, each small enough for one commit.
5. Data: list schema changes and how they stay compatible with the deployed code (`docs/guides/migrations.md`). Write "None" if none.
6. Risks and rollout: what can break, how it is detected, the flag if any (`docs/guides/feature-flags.md`), how to roll back.
7. Tests: map each `AC-n` to the test or e2e case that covers it.
8. After merge: what can only happen after merge or deploy, and who does it.
9. If the structure changes, update `docs/architecture.md` in the same change.
10. Show the plan and ask for an explicit CONFIRM. Any answer other than CONFIRM (or a clear yes) means: revise and ask again.

## Done when

- [ ] Every acceptance criterion has a test in the plan.
- [ ] Interfaces are concrete; no "TBD" in them.
- [ ] Invariants touched are named and still hold.
- [ ] The person answered CONFIRM.

## Don't

- Don't write code before CONFIRM.
- Don't add steps for things the spec doesn't ask for.
- Don't skip the data and rollout sections; write "None" when they don't apply.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
