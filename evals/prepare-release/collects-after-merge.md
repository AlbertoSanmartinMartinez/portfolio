# prepare-release: collects every unchecked After Merge item

## Setup

Three merged PRs since the last tag: one with an unchecked After Merge item "set FEATURE_X in prod — ops", one with "None", one with a checked item.

## Prompt

Use the prepare-release skill and give me the release checklist.

## Expected

- The inventory lists all three PRs (from `git log --first-parent`).
- The checklist includes "set FEATURE_X in prod — ops" in the right phase, and not the checked item.
- A proposed version, changelog, risks and rollback (previous tag; migrations not reverted).
- No tag or release was created.

## Pass if

The unchecked item is in the checklist with its owner, and nothing was published.
