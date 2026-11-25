# Privacy and data

How personal and confidential data is handled in code, tests, logs and Git. Applied by the Definition of done and `review-security`; no skill of its own.

## Project facts

| Fact | Value |
| --- | --- |
| Personal data the product stores | TODO(adopt): inventory (fields, purpose, where) |
| Retention | TODO(adopt) |
| Regulations that apply | TODO(adopt): for example GDPR |
| Who handles data requests | TODO(adopt) |

## Rules

1. Keep the inventory above current: a new personal field is added here in the same PR, with its purpose.
2. Collect only what the feature needs; delete it when the retention period ends.
3. Tests, seeds, fixtures and screenshots use synthetic data only.
4. Production data is never copied to local, dev or stage, not even "just to debug".
5. Logs, traces, metrics labels and error reports carry no personal data beyond opaque ids.
6. No customer names, personal data or internal hostnames in any Git text: commits, branches, PR and issue text, docs, test names. Use neutral replacements (`customer-a`, `user@example.test`).
7. Access to personal data goes through the same authorization as any other resource; no debug back doors.

## Checks

| Rule | Enforced by |
| --- | --- |
| Synthetic data (3, 4) | `review-security`, `docs/environments.md` |
| No personal data in logs (5) | `review-security`, `docs/guides/observability.md` |
| Confidentiality in Git (6) | `review-code`, `review-security` |
