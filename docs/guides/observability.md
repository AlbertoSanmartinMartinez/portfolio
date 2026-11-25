# Observability

What every change must leave behind so production problems can be seen and explained. Checked by the Definition of done and `review-code`; no skill of its own.

## Project facts

| Fact | Value |
| --- | --- |
| Logging library and format | Structured JSON to stdout, collected by App Platform; no runtime logging yet (the site is static) |
| Metrics and traces | None yet: App Platform insights for now |
| Error tracking | None yet |
| Dashboards and alerts | DigitalOcean App Platform insights and alerts, owned by Alberto |

## Rules

1. Logs are structured (key-value), with a level, and carry the request or trace id.
2. Never log secrets, tokens, full payloads with personal data, or credentials in URLs.
3. New behavior emits: the log events that explain it, at least one metric that shows it works (count, latency or error rate), and error capture for its failure paths.
4. Trace context is propagated across service and queue boundaries.
5. Expected errors are logged at the right level, not as crashes; unexpected ones reach error tracking with context.
6. New or changed dashboards and alerts are After Merge items with an owner.

## Checks

| Rule | Enforced by |
| --- | --- |
| Logs, metric and error capture for new behavior (3) | Definition of done in `AGENTS.md`, `review-code` |
| No secrets or personal data in logs (2) | `review-security`, `docs/guides/privacy.md` |
