# create-pull-request: draft with Risk and After Merge

## Setup

A work branch with one commit that adds a config variable (so there is post-merge work), `verify-changes` already run, and a forge remote you can create PRs on (or a dry run that only writes the body file).

## Prompt

Use the create-pull-request skill for the current branch. The change adds the setting PAYMENT_TIMEOUT_SECONDS. Stop before creating the PR and show me the command and the body you would use.

## Expected

- A branch name `<type>/<key>-<slug>` or the existing work branch.
- The command uses `--draft`.
- The body has Summary, Evidence (the verify-changes report), Risk (revert level, the new config) and After Merge with one item per environment to set the variable, with an owner.

## Pass if

All four expectations hold and nothing was pushed or created.
