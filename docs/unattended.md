# Unattended runs

How to run an agent with nobody answering its questions: a bot, a scheduled job, or a task launched from chat (Hermes) into a worktree (Orca). The rules in `AGENTS.md` still apply; what changes is that nobody can approve anything mid-run.

## Rules

1. The output of an unattended run is a draft PR (or a comment), never a merge, a release or a deploy.
2. Product questions are not decided silently: the run stops and lists them under "Questions" in its Handoff.
3. The run finishes only after commit, push and the Handoff block; background work left running is lost.
4. Each run works in its own worktree and branch, created from an up-to-date `main`.
5. Spend is capped at the model gateway or account (budgets per key), and runs have a turn or time limit.

## Claude Code

```bash
claude --agent tech-lead -p "<self-contained brief: issue, spec path, acceptance criteria>" \
  --permission-mode dontAsk --settings .claude/settings.unattended.json --max-turns 80
```

`dontAsk` turns every `ask` into a denial, so the run needs an explicit allow list. Keep it outside the repo or in `.claude/settings.unattended.json`, reviewed like code. A starting point:

```json
{
  "permissions": {
    "allow": [
      "Read", "Edit", "Write", "Glob", "Grep", "Skill",
      "Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)", "Bash(git add:*)",
      "Bash(git commit:*)", "Bash(git push -u origin HEAD:*)", "Bash(git pull --no-rebase origin main:*)",
      "Bash(gh pr create --draft:*)", "Bash(gh pr view:*)", "Bash(gh pr checks:*)",
      "Bash(python3 scripts/check_harness.py:*)"
    ]
  },
  "sandbox": { "enabled": true }
}
```

Add the project's test and lint commands from Project facts. The guard hook and the deny rules of `.claude/settings.json` still apply.

## Codex

Run `codex exec "<brief>"` with the sandbox in `workspace-write` and approvals set to `never`, in a trusted project so `.codex/hooks.json` loads. See [Codex approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security.md).

## Hermes and Orca

Hermes takes the request in chat and launches the coding agent in a new Orca worktree through a gate that only accepts fixed verbs (status, task, changes). The coding agent loads this harness from the worktree; Hermes never gets Docker, deploy or repository credentials of its own.

## What is not a boundary

- Pattern-matching guards and `ask` rules can be bypassed (`sh -c`, aliases, `git -C`). They catch mistakes, not attacks.
- Real boundaries: a separate OS user, the sandbox, one deploy key per repository with no access to others, no production secrets on the machine, and branch protection plus required checks in the forge.

## Watching runs

The draft PR is the record: its Evidence, Risk and After Merge sections, the Handoff block, and CI. Notify the person when a run ends or stops with questions.
