#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[audit] scanning for hardcoded endpoint markers..."
FILES_TO_SCAN=$(find . -maxdepth 4 -type f \( -name "*.html" -o -name "*.js" -o -name "*.gs" \))
grep -InE "script\.google\.com|AKfy|api[_-]?key|secret|token" $FILES_TO_SCAN 2>/dev/null || true

echo "[audit] scanning tracking defaults..."
grep -n "DEFAULT_EVENT_ENDPOINT" tracking.js || true

echo "[audit] done"
