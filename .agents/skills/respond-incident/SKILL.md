---
name: respond-incident
description: Handles an incident evidence first: gathers logs, metrics and recent changes, proposes mitigations for a person to approve, proves the root cause, and writes the postmortem from the template with timeline, why that day, why nobody saw it, and actions. Use when something is broken or degraded in a shared environment.
---

# Respond to an incident

## When

An alert, a report or a failing check shows something broken or degraded in dev, stage or prod.

## Read first

- `docs/environments.md`, `docs/architecture.md`, the runbooks in `docs/` if one matches.
- Recent changes: the last release, merges since then (`git log --first-parent`), config and flag changes.

## Steps

1. Scope: what fails, since when, who is affected, how badly. Write each fact with its evidence (log line, graph, request id, commit).
2. Stabilize: propose a mitigation (roll back to the previous tag, turn a flag off, scale, block a bad input) with its risk. A person approves and executes it; you don't deploy or change infrastructure.
3. Hypotheses: list them, then test each against the evidence. Keep the ones the evidence supports; drop the rest explicitly.
4. Root cause: proven when you can show the mechanism and reproduce it (a test, a query, a replayed request). If you can't prove it, say so.
5. Fix: a test that reproduces it first (`write-tests`), then the fix through the normal flow (`create-pull-request`), linked to the incident.
6. Postmortem: copy `docs/templates/postmortem.md` to `docs/incidents/<YYYY-MM-DD>-<slug>.md` and fill every section. "Why that day", "Why nobody saw it earlier" and "What the fix does not cover" are not optional.
7. Actions: one tracker item per action, with an owner. Add a check (test, alert, invariant) so it cannot recur silently.

## Done when

- [ ] Impact, timeline and root cause are written with evidence, or the cause is marked unproven.
- [ ] Mitigation was approved by a person.
- [ ] The postmortem and its actions exist.

## Don't

- Don't blame people; describe systems and decisions.
- Don't paste secrets or personal data from logs into the postmortem.
- Don't publish anything outside the team unless a person asks.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
