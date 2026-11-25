#!/usr/bin/env bash
# Local Docker Compose stack for this worktree.
#
#   scripts/stack.sh up            start it and wait until healthy
#   scripts/stack.sh info          services, URLs and ports
#   scripts/stack.sh logs [svc]    follow logs
#   scripts/stack.sh seed          load synthetic data and test accounts (scripts/seed.sh)
#   scripts/stack.sh down          stop it and remove its volumes
#
# The Compose project name is <repo>-<worktree>, so every git worktree has its own
# stack and `down` never touches another one. Host ports are dynamic and bound to
# 127.0.0.1; `info` prints them.
set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$root"

slug() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_-' '-' | sed 's/^[^a-z0-9]*//'; }
common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null || echo "$root/.git")
repo=$(basename "$(dirname "$common")")
tree=$(basename "$root")
if [ "$repo" = "$tree" ]; then project=$(slug "$repo"); else project=$(slug "$repo-$tree"); fi

command -v docker >/dev/null 2>&1 || { echo "stack: docker is not installed or not on PATH" >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "stack: the Docker daemon is not running" >&2; exit 1; }
[ -f compose.yaml ] || { echo "stack: no compose.yaml in $root" >&2; exit 1; }

dc() { docker compose -p "$project" -f compose.yaml "$@"; }

info() {
  echo "stack: $project"
  STACK_PS=$(dc ps --all --format json) python3 - <<'PY'
import json, os
raw = os.environ["STACK_PS"].strip()
rows = json.loads(raw) if raw.startswith("[") else [json.loads(l) for l in raw.splitlines() if l.strip()]
for r in rows:
    ports = sorted({"%s:%s -> %s" % (p["URL"], p["PublishedPort"], p["TargetPort"])
                    for p in (r.get("Publishers") or []) if p.get("PublishedPort")})
    print("  %-10s %-8s %-10s %s" % (r["Service"], r["State"], r.get("Health") or "-",
                                    ", ".join(ports) or "no published ports"))
# Variables for the app, the tests and the db-local MCP server (local only).
ports = {(r["Service"], p.get("TargetPort")): (p["URL"], p["PublishedPort"])
         for r in rows for p in (r.get("Publishers") or []) if p.get("PublishedPort")}
if ("db", 5432) in ports:
    dsn = "postgres://app:app@%s:%s/app?sslmode=disable" % ports[("db", 5432)]
    print("\nexport DATABASE_URL=%s\nexport DB_LOCAL_DSN=%s" % (dsn, dsn))
if ("mail", 1025) in ports:
    host, port = ports[("mail", 1025)]
    print("export SMTP_HOST=%s SMTP_PORT=%s MAIL_FROM=web@example.test MAIL_TO=alberto@example.test" % (host, port))
if ("mail", 8025) in ports:
    print("export MAILPIT_URL=http://%s:%s" % ports[("mail", 8025)])
PY
}

case "${1:-}" in
  up)
    dc up -d --wait
    info
    ;;
  info)
    info
    ;;
  logs)
    shift
    dc logs -f --tail=200 "$@"
    ;;
  seed)
    [ -x scripts/seed.sh ] || { echo "stack: no executable scripts/seed.sh" >&2; exit 1; }
    STACK_PROJECT="$project" scripts/seed.sh
    ;;
  down)
    dc down -v --remove-orphans
    ;;
  *)
    sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac
