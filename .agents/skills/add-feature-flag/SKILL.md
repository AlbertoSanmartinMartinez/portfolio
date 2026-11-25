---
name: add-feature-flag
description: Puts unfinished or risky behavior behind a flag that is off by default — declared once with owner and removal date, read through one module, tested in both states — and creates the tracker item to remove it. Use when work must merge before it can be switched on.
---

# Add a feature flag

## When

The plan ships behavior in several PRs, or a risky change needs a controlled rollout.

## Read first

- `docs/guides/feature-flags.md`: the mechanism and the registry.

## Steps

1. Declare the flag in the registry: name, purpose, owner, default off, removal date.
2. Read it only through the flags module, at as few points as possible.
3. Write tests for both states.
4. Create the tracker item to remove the flag and the dead branch, linked from the registry entry.
5. In After Merge: who turns it on, in which environment, and when.

## Done when

- [ ] The flag is declared with owner and date, off by default.
- [ ] Both states are tested; the removal item exists.

## Don't

- Don't put secrets or per-customer configuration behind a flag.
- Don't leave flags past their removal date; report them in review.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
