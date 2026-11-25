#!/usr/bin/env bash
# Git pre-push hook body (INV-003): refuses pushes to protected branches.
# A person who really needs it (for example, a repo without pull requests) runs:
#   HARNESS_ALLOW_PROTECTED_PUSH=1 git push ...
# Protected branches: HARNESS_PROTECTED_BRANCHES (default "main master").
set -euo pipefail
[ "${HARNESS_ALLOW_PROTECTED_PUSH:-}" = "1" ] && exit 0
protected=" ${HARNESS_PROTECTED_BRANCHES:-main master} "
status=0
while read -r local_ref local_sha remote_ref remote_sha; do
  [ -z "${remote_ref:-}" ] && continue
  case "$remote_ref" in
    refs/heads/*)
      name=${remote_ref#refs/heads/}
      if [[ "$protected" == *" $name "* ]]; then
        echo "pre-push: direct push to protected branch '$name' refused; open a pull request" >&2
        status=1
      fi
      ;;
  esac
done
exit $status
