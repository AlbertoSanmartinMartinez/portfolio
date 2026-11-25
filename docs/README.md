# Docs

| Document | What it holds |
| --- | --- |
| [architecture.md](architecture.md) | Components, boundaries, main flows, where things live |
| [glossary.md](glossary.md) | Domain terms and their names in the code |
| [invariants.md](invariants.md) | Rules that must always hold, each with the check that enforces it |
| [metrics.md](metrics.md) | Product and engineering metrics, with their definitions |
| [decisions.md](decisions.md) | Decision log (ADRs), one file, append only |
| [environments.md](environments.md) | Local, dev, stage and prod, and what e2e tests may do in each |
| [harness.md](harness.md) | How the agent harness works, per agent, and how to extend it |
| [unattended.md](unattended.md) | Running agents without a person in the loop |
| [guides/](guides/) | How to do recurring work in this project |
| `runbooks/` | Step-by-step operations, created when first needed |
| `incidents/` | Postmortems, one file per incident, created when first needed |
| [templates/](templates/) | Templates for specs, decisions, runbooks and postmortems |

Feature specs live in [`../specs/`](../specs/README.md). The docs folder opens as an Obsidian vault; links are standard markdown so GitHub, GitLab and agents follow them too.
