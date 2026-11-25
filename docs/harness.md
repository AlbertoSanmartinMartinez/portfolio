# Harness

How the agent harness works, what each agent picks up, and how to extend it. Rules for agents live in [`AGENTS.md`](../AGENTS.md); this page explains the machinery.

## One source, thin pointers

| Piece | Canonical | Pointers |
| --- | --- | --- |
| Instructions | `AGENTS.md` (and `<folder>/AGENTS.md`) | `CLAUDE.md` next to each one, containing only `@AGENTS.md`; `.gemini/settings.json` |
| Skills | `.agents/skills/<name>/SKILL.md` | One symlink per skill in `.claude/skills/` |
| Roles | `.claude/agents/<role>.md` | Agents without subagents read the file as a playbook |
| Guard and hooks | `.agents/hooks/*.sh` | `.claude/settings.json`, `.codex/hooks.json`, `.githooks/` |
| MCP servers | `.mcp.json` | `.cursor/mcp.json` (symlink), `.codex/config.toml` (mirror, checked) |

`scripts/check_harness.py` keeps the pointers honest: it fails on missing or broken symlinks, a `CLAUDE.md` that isn't `@AGENTS.md`, a Codex MCP mirror that drifted, and the rest listed in its docstring.

## What each agent gets

Verified against each tool's official documentation on 2026-11-25. Re-check when a tool changes.

| | Claude Code | Codex CLI | Cursor | OpenCode | Copilot | Gemini CLI | Hermes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | Via `CLAUDE.md` import | Yes, root to cwd | Yes, nested too | Yes, nested too | Yes, nearest wins | Via `.gemini/settings.json` | Yes |
| Skills | `.claude/skills` links | `.agents/skills` | `.agents/skills` (+ `.claude/skills`) | `.agents/skills` (+ `.claude/skills`) | `.agents/skills` (+ `.claude/skills`) | `.agents/skills` | After `hermes skills trust`, or `skills.external_dirs` |
| Roles as subagents | Yes | Playbook | Yes (`.claude/agents`) | Playbook | VS Code yes; CLI and cloud playbook | Playbook | Playbook |
| Guard hook | `.claude/settings.json` | `.codex/hooks.json` (trusted project) | Reads `.claude/settings.json` | None: git hooks only | CLI reads `.claude/settings.json` | None: git hooks only | User `config.yaml` only |
| MCP | `.mcp.json` | `.codex/config.toml` (trusted project) | `.cursor/mcp.json` | Not configured | CLI and VS Code: `.mcp.json` | Not configured | User `config.yaml` only |
| Permissions | `.claude/settings.json` | Sandbox and approvals per user | Per user | Per user | Per user | Per user | Per user |

Known gaps and quirks:

- Claude Code ignores nested `AGENTS.md` files when a `CLAUDE.md` exists above them; that is why every `AGENTS.md` has its own `CLAUDE.md` next to it.
- Cursor, Copilot and OpenCode scan both `.agents/skills` and `.claude/skills`, so skills may show twice. They are the same files.
- Codex reads `.codex/` only in trusted projects and asks to review each hook once.
- The git hooks (`.githooks/`) and CI are the only checks every agent and every person passes through. Activate them with `git config core.hooksPath .githooks`.
- Gemini CLI's free tier moved to Antigravity CLI in June 2026; the settings file still works with paid keys.

Sources: [Claude Code memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks); [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills), [hooks](https://learn.chatgpt.com/docs/hooks), [MCP](https://learn.chatgpt.com/docs/extend/mcp.md); [Cursor rules](https://cursor.com/docs/context/rules), [skills](https://cursor.com/docs/context/skills), [hooks](https://cursor.com/docs/agent/hooks); [OpenCode rules](https://opencode.ai/docs/rules), [skills](https://opencode.ai/docs/skills); [Copilot instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), [hooks](https://docs.github.com/en/copilot/reference/hooks-reference); [Gemini CLI context](https://geminicli.com/docs/cli/gemini-md); [Hermes context files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files), [skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills); [Agent Skills specification](https://agentskills.io/specification).

### Hermes

Hermes loads `AGENTS.md` from the working directory. To give it this project's skills, either run `hermes skills trust` in the repo, or add the folder to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs: [/path/to/repo/.agents/skills]
```

In the reference setup Hermes orchestrates from chat and launches a coding agent in a worktree; that agent loads the harness. Hooks, MCP and approvals for Hermes itself live in the user's `config.yaml`.

## Naming

| Piece | Form | Example |
| --- | --- | --- |
| Skill | `<action>-<object>`, 2–3 words, action first | `create-pull-request` |
| Role | Noun, 1–2 words | `tech-lead` |
| MCP server | The system it reaches, 1–2 words | `db-local` |
| Hook script | `<action>-<object>.sh` | `block-unsafe-commands.sh` |
| Spec folder | `specs/<NNN>-<slug>/` | `specs/007-export-csv/` |

Skill actions: `write`, `record`, `design`, `run`, `verify`, `create`, `monitor`, `review`, `prepare`, `respond`, `adopt`, `generate`, `add`, `update`. Hook actions: `block`, `scan`, `format`. The Agent Skills standard allows only lowercase letters, digits and single hyphens, so the position of the words, not an underscore, separates action and object.

## Budgets

| File | Limit | Why |
| --- | --- | --- |
| `AGENTS.md` | 150 lines | Loaded in every session |
| Nested `AGENTS.md` | 40 lines | Loaded when the agent works in that folder |
| Skill body | 120 lines | Loaded when the skill is used |
| Role body | 80 lines | Loaded when the role runs |

Only skill descriptions are always in context: keep them to one line that says what the skill does and when to use it.

## Extending

- **Skill:** create `.agents/skills/<action>-<object>/SKILL.md` with `name` and `description` frontmatter and the sections When, Read first, Steps, Done when, Don't, Improve this skill. Then `ln -s ../../.agents/skills/<name> .claude/skills/<name>`. Cite Project facts instead of hard-coding commands.
- **Role:** create `.claude/agents/<role>.md` with `name`, `description`, optional `tools` (omit Edit and Write for read-only roles), `skills`, and a Handoff section. Add it to the roles table in `AGENTS.md` and to the tech lead's table.
- **Hook:** put the script in `.agents/hooks/`, executable, reading the payload on stdin and exiting 2 to block. Register it in `.claude/settings.json` and `.codex/hooks.json`.
- **MCP server:** add it to `.mcp.json` with an exact version, secrets only as `${VAR}` references; mirror it in `.codex/config.toml` (use `env_vars` to forward variables). Prefer an existing CLI (`gh`, `glab`) over a new server: every server's tool descriptions cost context in every session.
- **Folder instructions:** `<folder>/AGENTS.md` plus `<folder>/CLAUDE.md` with `@AGENTS.md`.
- **Rule that must always hold:** add it to `docs/invariants.md` with the path of the check that enforces it.

## Evals

`evals/<skill>/<scenario>.md` hold one scenario per critical skill: setup, prompt, expected behavior, pass criteria. Run them by hand when a skill changes, with each agent you use:

```bash
claude -p "$(sed -n '/^## Prompt/,/^## /p' evals/review-code/finds-planted-bug.md)"
codex exec "$(sed -n '/^## Prompt/,/^## /p' evals/review-code/finds-planted-bug.md)"
```

Record pass or fail in the PR that changes the skill.

## Upgrading the template

`.harness-version` holds the template version this project is on. The `update-harness` skill merges a newer `harness-vX.Y.Z` from Agentic-SDLC file by file, keeping what the project filled in.

## Evaluated and left out

| Option | Why not |
| --- | --- |
| Code knowledge graph (codebase-memory-mcp, cgraphy) | The 99% token saving is self-reported from five questions; it answers only structural questions and its index must be kept fresh |
| Vector database (claude-context) | No production CLI agent uses one by default for code; the index goes stale, it needs infrastructure, and code leaves for an embeddings API |
| Serena (LSP over MCP) | No independent benchmark; needs language servers and adds many tools to every prompt |
| RTK (command output compression) | Real-world savings of 20–50%; it can hide the context needed to debug, and stores full outputs on disk |
| Automatic memory | Memory poisoning risk; lasting knowledge goes to decisions and the glossary, reviewed in PRs |

Measure before adding any of them: record the tokens and cost of the same change with and without it in `docs/metrics.md`.
