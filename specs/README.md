# Specs

Every feature gets a folder `specs/<NNN>-<slug>/` before any code: `NNN` is the next free three-digit number, `slug` is kebab-case. Copy the files from `docs/templates/`.

| File | Answers | Written by | Gate |
| --- | --- | --- | --- |
| `intent.md` | Why, for whom, what success looks like | `product-owner` with `write-intent` | — |
| `spec.md` | What the system does: behavior, acceptance criteria, UI states and copy | `product-owner` and `designer` with `write-spec` and `design-ui` | A person approves it before planning |
| `plan.md` | How: interfaces, steps, risks, rollout | `architect` with `write-plan` | Waits for an explicit CONFIRM before code |

Rules:

- Acceptance criteria are numbered (`AC-1`, `AC-2`…) and testable; tests and e2e evidence cite them.
- Terms come from `docs/glossary.md`. A new term goes there first.
- Status lives in the frontmatter (`draft`, `approved`, `done`) and in the tracker, not in prose.
- A spec that changes after approval goes back through its gate.
- Specs are never deleted. When the feature ships, set `status: done` and link the PR.
