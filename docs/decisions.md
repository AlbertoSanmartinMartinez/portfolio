# Decisions

One file, append only. Take the next free number; if two branches take the same one, the second to merge renumbers. Each entry links its plan when there is one, and the plan gets a "Landed in ADR-NNNN" line at its top. Copy the format from [templates/adr.md](templates/adr.md).

## ADR-0001: Adopt the Agentic SDLC harness template

- Date: TODO(adopt)
- Status: accepted
- Context: coding agents work on this repo and need the same rules, flow and checks whatever the tool.
- Decision: use the Agentic SDLC harness template (version in `.harness-version`): `AGENTS.md` as the single source, skills and roles in `.agents/`, specs before code, checks in CI.
- Consequences: harness changes need a person's review; template upgrades arrive through `update-harness`.
