---
name: write-tests
description: Writes unit and integration tests that cover the acceptance criteria of a spec, watching each new test fail before the fix, with fakes for ports and real dependencies only in integration tests. Use while implementing a plan or fixing a bug.
---

# Write tests

## When

While implementing a plan step, when fixing a bug (first a test that reproduces it), or when coverage of the changed lines is missing.

## Read first

- `docs/guides/testing.md`: what goes in each level, fakes, flaky tests, diff coverage.
- The plan's "Tests" section and the spec's acceptance criteria (`AC-n`).
- Existing tests next to the code you change: copy their style, helpers and fixtures.

## Steps

1. For each behavior, pick the lowest level that proves it: unit with fakes for logic, integration for adapters and real I/O, e2e only for user journeys (`run-e2e-tests`).
2. Write the test first and run it. It must fail for the right reason. A test that was never seen failing does not count.
3. Make it pass with the smallest change. Run it again, then the related suite (commands from Project facts).
4. Name tests after the behavior, and cite the criterion when there is one (`test_ac2_rejects_expired_token`).
5. Assert outcomes, not implementation details. One reason to fail per test.
6. Keep tests independent and safe to run in parallel: no shared state, no order, no real network, no wall clock (inject a clock).
7. Data: synthetic only, built by factories or the seed (`scripts/stack.sh seed`). Never real personal data.
8. If you find a flaky test, don't retry it into green: quarantine it as `docs/guides/testing.md` says and open a tracker item.

## Done when

- [ ] Every acceptance criterion in scope has a passing test, and you saw each new test fail first.
- [ ] The changed lines are covered (diff coverage), or the gap is explained in the PR.
- [ ] The suite for the changed paths passes locally.

## Don't

- Don't delete or weaken an existing test to make a change pass; explain why it is wrong instead.
- Don't mock what you own when an in-memory fake is simple.
- Don't add sleeps; wait for a condition.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
