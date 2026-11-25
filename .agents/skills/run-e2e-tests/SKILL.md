---
name: run-e2e-tests
description: Runs the project's end-to-end suite and an exploratory pass with the browser MCP server against an environment (local, dev, stage, or read-only smoke in prod), covering UI and playground, and returns evidence with screenshots per acceptance criterion. Use to verify user-facing changes before review or after a deploy.
---

# Run e2e tests

## When

A change affects what a user or caller sees, before asking for review; after a deploy to dev or stage; for a production smoke after a release, only with a person's explicit OK.

## Read first

- `docs/environments.md`: URLs, access variables, and what is allowed in each environment.
- The spec's acceptance criteria and "UI and UX" section.
- `docs/guides/testing.md`: e2e scope, test data, flaky tests.

## Steps

1. Pick the environment. Local: `run-local-stack` (`up`, `seed`, `info` for the URL). Prod: stop and ask the person for an explicit OK first, and run read-only checks only.
2. Run the project's e2e suite with the E2E command from Project facts, pointing at that environment. Quiet reporter; read failures, not the whole log.
3. Exploratory pass with the `browser` MCP server, for each acceptance criterion the change touches:
   - Walk the flow as a user, including the error states the spec lists.
   - Exercise the playground or API explorer if the change touches the API.
   - Take a screenshot of each state that proves a criterion.
4. Check the basics on every screen you touched: console errors, failed network calls, keyboard navigation, the copy matches the spec.
5. A failure: reproduce it once more, then report it with steps, screenshot and the console or network error. Don't fix it inside this skill.
6. Write the evidence: a table `AC-n | how it was checked | result | screenshot`. Attach screenshots to the PR or MR, never to the repo.

## Done when

- [ ] The suite passed, or each failure is reported with evidence.
- [ ] Every touched acceptance criterion has a result and, for UI, a screenshot.
- [ ] Nothing was written in prod.

## Don't

- Don't run anything that writes, signs up, pays or emails in prod.
- Don't use real personal data or real accounts outside the test accounts in `docs/environments.md`.
- Don't paste tokens or cookies into notes, screenshots or the PR.

## Improve this skill

If a step was wrong, missing or wasted effort, end your report with a proposed diff to this file. Don't apply it: harness changes need a person's review.
