# review-code: finds a planted bug and nothing else

## Setup

A branch whose diff adds a function `is_adult(age)` returning `age > 18`, with a spec criterion "AC-1: 18-year-olds are adults" and a test that only checks 30 and 10.

## Prompt

Use the review-code skill on the current branch against main and give me the verdict.

## Expected

- Verdict: changes needed.
- One blocking finding at the comparison line: 18 is rejected, breaking AC-1, with the failing input.
- One important finding: the test misses the boundary.
- No style or speculative findings.

## Pass if

Both findings are reported with `file:line` and there are no other blocking or important findings.
