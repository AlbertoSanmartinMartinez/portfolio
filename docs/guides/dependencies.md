# Dependencies

How libraries, internal packages, tools and base images get in and stay current. Skills: `add-dependency` and `update-dependencies`.

## Project facts

| Fact | Value |
| --- | --- |
| Package managers and lockfiles | pnpm, `pnpm-lock.yaml` |
| Workspace layout (internal libraries) | One package, no workspaces |
| Import boundaries and their check | UI components never import `src/db/`; checked by ESLint `no-restricted-imports` in `eslint.config.mjs` |
| License allowlist | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD |
| Release-age quarantine | 7 days (`minimumReleaseAge: 10080` in `pnpm-workspace.yaml`, `cooldown` in `.github/dependabot.yml`) |
| Automated updates | Dependabot, `.github/dependabot.yml` |

## Rules

1. Add, remove and upgrade only through the package manager. The lockfile is committed and never edited by hand.
2. CI installs from the exact lockfile and fails on a mismatch (`--locked`, `--frozen-lockfile`, `npm ci`…).
3. Every new dependency is justified in the PR: what it is for, alternatives considered (including writing it), license, maintenance and size.
4. Internal libraries are consumed as workspace packages, never copied. Shared code depends on nothing feature-specific: a `core` package never imports a module.
5. Minor and patch updates go in routinely. A major only after reading its breaking changes and searching the code for each one; check license, engines and peer dependencies again.
6. New releases wait the quarantine period before they are adopted, except security fixes.
7. Every override or resolution has a comment: who needs it and what breaks without it. Remove overrides that are no longer needed.
8. Fix vulnerabilities by upgrading the direct dependency first, then its parent; never force the lockfile.
9. Container base images are pinned by digest (`name:tag@sha256:…`).
10. No new managed cloud service or data store without a decision in `docs/decisions.md`.

## Checks

| Rule | Enforced by |
| --- | --- |
| Lockfile in sync (1, 2) | `pnpm install --frozen-lockfile` in `.github/workflows/ci.yml` |
| Known vulnerabilities (8) | OSV-Scanner in `.github/workflows/quality.yml` and `.gitlab-ci.yml` |
| Import boundaries (4) | ESLint `no-restricted-imports` in `eslint.config.mjs` |
| Justification and license (3, 5) | `review-code`, `review-security` |
