---
name: record-decision
description: Appends an ADR to docs/decisions.md with the next free number, links it from the plan, and updates the glossary if the decision names new concepts. Use when a lasting technical or product decision is made.
---

# Record a decision

## When

A choice that future work must respect: a library, a boundary, a data model, a protocol, a policy. Not for choices local to one feature.

## Read first

- `docs/decisions.md`: existing ADRs, so you don't contradict or duplicate one.
- `docs/templates/adr.md`: the format.
- Open PRs or MRs that add ADRs (forge CLI from Project facts), to avoid taking the same number.

## Steps

1. Find the next free number: the highest in `docs/decisions.md` on `main` and in open PRs, plus one.
2. Append the entry at the end of `docs/decisions.md` using the template. Status `proposed` until a person accepts it.
3. Context: the forces in two or three sentences. Decision: what we do. Consequences: what gets easier, harder, and what to watch.
4. If a plan exists, add `Plan: specs/<NNN>-<slug>/plan.md` to the ADR and link the ADR from the plan.
5. If the decision supersedes an older ADR, set the old one's status to `superseded by ADR-NNNN`. That is the only edit allowed to an old entry.
6. New concepts go to `docs/glossary.md`. A new rule that must always hold goes to `docs/invariants.md` with its check.
7. When the plan lands, add a "Landed in ADR-NNNN" line at the top of the plan.

## Done when

- [ ] The ADR has a unique number, a date and a status.
- [ ] Plan and ADR link each other when both exist.
- [ ] Glossary and invariants reflect the decision.

## Don't

- Don't rewrite or delete past ADRs; supersede them.
- Don't create one file per ADR.
- Don't mark it accepted without a person.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
