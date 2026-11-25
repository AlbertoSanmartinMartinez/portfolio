---
name: review-code
description: Reviews a diff for correctness, scope, tests, invariants and the Definition of done, reporting only findings it can prove, ranked blocking, important or minor, without editing anything. Use before marking a PR ready or when asked to review a branch.
---

# Review code

## When

A PR or branch needs review before a person marks it ready, or after fixes to earlier findings. Read-only: you report, someone else fixes.

## Read first

- The diff (`git diff origin/main...HEAD`) and the PR body.
- The spec and plan it implements, `docs/invariants.md`, `docs/architecture.md`, and the guides for what it touches.

## Steps

1. Check the branch is current with `main` and the diff matches the plan. Unplanned changes are a finding.
2. Read every changed file in full where the change sits, not just the hunks.
3. Look for: wrong behavior against the spec's acceptance criteria; broken or missing error handling; boundary violations; touched invariants; missing migration, regenerated code or config; dead code; secrets or personal data; missing logs, metric or error capture for new behavior; expired feature flags.
4. Tests: does each acceptance criterion have one, and would it fail if the code were wrong?
5. Before reporting a finding, pass the gate. Report it only if all four are true:
   - You can point to the exact `file:line`.
   - You can describe the input or state that breaks it.
   - It is not already handled elsewhere (you checked).
   - You are more than 80% sure. Blocking findings need proof: a failing command, a test, or a trace.
6. Skip common false positives: style the linter owns, hypothetical futures, preferences without a rule behind them.
7. Report, most severe first:

```
Verdict: ready | changes needed
Blocking: <file:line> — <what breaks, when, evidence>
Important: …
Minor: …
Checked and fine: <areas reviewed with no findings>
```

Zero findings is a valid result.

## Done when

- [ ] Every finding has `file:line`, a failure scenario and a severity.
- [ ] The verdict follows from the findings.

## Don't

- Don't edit files or push.
- Don't pad the report with low-confidence findings.
- Don't repeat findings already answered in the PR threads unless the answer is wrong.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
