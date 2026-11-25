---
name: add-dependency
description: Adds a library, internal workspace package, tool or base image the right way — justified, through the package manager, pinned in the lockfile, license-checked, scanned for vulnerabilities and inside the import boundaries. Use when a plan step needs a new dependency.
---

# Add a dependency

## When

The plan needs code you don't want to write, an internal package from another workspace, a CLI tool, or a container base image.

## Read first

- `docs/guides/dependencies.md`: package managers, workspace layout, boundaries, license allowlist, quarantine.
- The plan, to confirm the dependency is part of it. Not in the plan ⇒ ask the architect or the person.

## Steps

1. Check the need: could existing dependencies or a few lines of code do it? Write the answer for the PR.
2. Internal code: add the workspace package as a dependency of the consumer; never copy its files. Check the import respects the boundaries (a `core` package never imports a module).
3. External library: pick the version (released longer ago than the quarantine, unless it is a security fix), check the license against the allowlist, its maintenance and size.
4. Add it with the package manager command so the lockfile updates. Never edit the lockfile by hand.
5. Base image: reference it as `name:tag@sha256:<digest>`.
6. Install in locked mode, run the boundary check, types and tests.
7. In the PR Risk section, list the dependency with: purpose, alternatives considered, license, version and why that version.

## Done when

- [ ] The lockfile changed only for this dependency and its tree.
- [ ] Locked install, boundary check and tests pass; no known vulnerabilities reported.
- [ ] The PR justifies it.

## Don't

- Don't add a dependency for a one-liner.
- Don't add a new data store or managed cloud service without a decision in `docs/decisions.md`.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
