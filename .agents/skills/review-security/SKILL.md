---
name: review-security
description: Reviews a diff against a generic security checklist (secrets, authorization at every boundary, injection, SSRF, dependencies, data exposure, logging) plus the project's own security rules, reporting proven findings by severity without editing. Use before marking ready any PR that touches auth, input handling, data access, dependencies or infrastructure.
---

# Review security

## When

A PR touches authentication or authorization, input parsing, queries, file or network access, secrets, personal data, dependencies, CI or infrastructure. Read-only.

## Read first

- The diff and the PR body.
- `docs/invariants.md`, `docs/guides/privacy.md`, `docs/guides/config-secrets.md`.
- `docs/security.md` and the "Project rules" in `AGENTS.md`, if the project has them.

## Steps

1. Secrets: none in code, config, fixtures, logs, prompts or docs; read from the environment or secret store.
2. Authorization: every entry point (route, handler, job, tool call) checks who the caller is and what they may do on that resource, not only at the edge. Data of one tenant or user never reaches another.
3. Input: validated at the boundary; queries parameterized; no shell, template or path built from input; uploads checked for type and size.
4. Outbound requests to URLs a user can influence: block private, loopback and metadata ranges, force HTTPS, re-check every redirect.
5. Data exposure: responses, errors and logs carry no secrets, tokens or unneeded personal data; errors don't leak internals.
6. Dependencies: new ones are justified, pinned and free of known vulnerabilities (OSV-Scanner result in CI); licenses allowed.
7. CI and infrastructure: actions pinned by SHA, minimal permissions, secrets only in the step that needs them, no deploys from agents.
8. Apply the same evidence gate as `review-code`: `file:line`, a concrete attack or failure, checked it isn't handled elsewhere, more than 80% sure.
9. Report:

```
Verdict: ready | changes needed
Critical / High / Medium / Low: <file:line> — <attack or failure, evidence>
Checked and fine: <areas>
```

## Done when

- [ ] Each checklist area is either a finding or listed as checked.
- [ ] Every finding has evidence and a severity.

## Don't

- Don't edit, exploit against shared environments, or exfiltrate anything to prove a point.
- Don't paste secrets you find into the report; give the location only.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
