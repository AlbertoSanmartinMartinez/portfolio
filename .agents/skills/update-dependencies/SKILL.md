---
name: update-dependencies
description: Upgrades dependencies safely — minors and patches routinely, majors only after reading their breaking changes, vulnerabilities fixed at the direct dependency, overrides audited — one ecosystem per PR. Use for scheduled upgrades, Renovate or Dependabot follow-ups, or a vulnerability alert.
---

# Update dependencies

## When

A scheduled upgrade, an automated update PR that needs work, or a vulnerability alert.

## Read first

- `docs/guides/dependencies.md`: quarantine, license allowlist, overrides policy.
- The package manager's outdated and audit reports.

## Steps

1. Scope: one ecosystem (one lockfile) per PR. A security fix may go alone and skip the quarantine.
2. Inventory: outdated packages, pinned ones and why, overrides and patches. Skip releases younger than the quarantine.
3. Minor and patch: upgrade them together, then run types and tests.
4. Majors: one at a time. Read its changelog or migration guide, search the code for each breaking change, adapt, re-check license, engines and peers. Too much breakage: revert that package and report it.
5. Vulnerabilities: upgrade the direct dependency that pulls the bad version, then its parent. Use an override only as a last resort, with a comment saying who needs it and what breaks.
6. Remove overrides and patches that are no longer needed; deduplicate the lockfile.
7. Re-run the vulnerability scan until nothing fixable remains.
8. PR body: what was upgraded, majors with their notes, what was skipped and why.

## Done when

- [ ] Locked install, types, tests and the vulnerability scan pass.
- [ ] Every remaining override has its comment.

## Don't

- Don't mix ecosystems or unrelated code changes in the same PR.
- Don't force versions a framework pins on purpose.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
