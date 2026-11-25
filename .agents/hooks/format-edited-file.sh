#!/usr/bin/env bash
# Post-edit hook: formats only the file that was just edited, with the formatter the
# project already uses. Never fails the edit: formatting problems surface in lint.
# Adapt the case list to the project (adopt-template).
set -uo pipefail
payload=$(cat)
file=$(HOOK_PAYLOAD="$payload" python3 -c '
import json, os
try:
    d = json.loads(os.environ["HOOK_PAYLOAD"] or "{}")
except ValueError:
    d = {}
ti = d.get("tool_input") if isinstance(d.get("tool_input"), dict) else {}
print(ti.get("file_path") or d.get("file_path") or "")
' 2>/dev/null) || exit 0
[ -n "$file" ] && [ -f "$file" ] || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
case "$file" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.md|*.yaml|*.yml|*.html|*.vue|*.svelte)
    [ -x "$root/node_modules/.bin/prettier" ] && "$root/node_modules/.bin/prettier" --write --log-level warn "$file" ;;
  *.py)
    if command -v ruff >/dev/null 2>&1 && grep -qs '\[tool.ruff' "$root/pyproject.toml"; then ruff format -q "$file"; fi ;;
  *.go)
    command -v gofmt >/dev/null 2>&1 && gofmt -w "$file" ;;
  *.rs)
    command -v rustfmt >/dev/null 2>&1 && rustfmt -q "$file" ;;
esac
exit 0
