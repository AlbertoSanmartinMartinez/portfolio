# Testing

What is tested where, with which data, and what to do with flaky tests. Skills: `write-tests` and `run-e2e-tests`.

## Project facts

| Fact | Value |
| --- | --- |
| Unit and integration frameworks | Vitest |
| E2E framework | Playwright Test |
| Where tests live | `tests/unit/`, `tests/integration/`, `tests/e2e/` |
| Diff coverage target | 80% of changed lines |
| Quarantine mechanism | `test.fixme` or `it.skip` with a comment `quarantined: ALB-<n> until <date>`; CI reports skipped tests |

## Levels

| Level | Proves | Dependencies |
| --- | --- | --- |
| Unit | Logic and rules | In-memory fakes for ports; no I/O |
| Integration | Adapters against real infrastructure | The local stack (`scripts/stack.sh up`) |
| E2E | User journeys and the playground, per acceptance criterion | A running environment (`docs/environments.md`) |

## Rules

1. Every acceptance criterion (`AC-n`) has a test at the lowest level that proves it; e2e only for journeys.
2. A new test is seen failing before it passes. A test never seen failing does not count.
3. Tests are independent and safe to run in parallel: no shared state, no order, no real network in unit tests, an injected clock.
4. Assert outcomes, not implementation details.
5. Data is synthetic: factories, fixtures and `scripts/stack.sh seed`. Never real personal data or production copies (`docs/guides/privacy.md`).
6. Changed lines meet the diff coverage target, or the PR explains the gap.
7. A flaky test is quarantined with a tracker item and a deadline, never retried into green. Quarantine is not deletion.
8. Don't delete or weaken a failing test to make a change pass; explain why it is wrong.

## Checks

| Rule | Enforced by |
| --- | --- |
| Tests pass for changed paths | CI, `verify-changes` |
| Diff coverage (6) | diff-cover in `.github/workflows/ci.yml` |
| Criteria covered (1) | `review-code`, the PR's Evidence section |
