#!/usr/bin/env bash
# Pre-commit secret scan of the staged changes (INV-001). Uses gitleaks when it is
# installed; otherwise warns and lets the commit through (CI scans again).
set -euo pipefail
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "scan-secrets: gitleaks is not installed; skipping (CI still scans). Install: https://github.com/gitleaks/gitleaks" >&2
  exit 0
fi
exec gitleaks git --pre-commit --staged --redact --no-banner .
