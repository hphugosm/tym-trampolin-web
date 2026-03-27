#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <collector_endpoint> <admin_token> [hours] [namespace]"
  echo "Example: $0 https://.../exec myIncidentToken 24 tym-trampolin-web"
  exit 1
fi

ENDPOINT="$1"
TOKEN="$2"
HOURS="${3:-24}"
NAMESPACE="${4:-}"

URL="${ENDPOINT}"
SEP='?'
if [[ "$URL" == *"?"* ]]; then
  SEP='&'
fi
URL+="${SEP}mode=purge_recent&hours=${HOURS}&token=${TOKEN}"
if [[ -n "$NAMESPACE" ]]; then
  URL+="&namespace=${NAMESPACE}"
fi

curl --fail --silent --show-error "$URL"
