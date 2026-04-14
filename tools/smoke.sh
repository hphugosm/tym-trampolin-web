#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

pages=(
  "index.html"
  "o-tymu.html"
  "uspechy.html"
  "psali-o-nas.html"
  "podpora.html"
  "kontakt.html"
  "eshop_tym_trampolin.html"
  "album-listen.html"
  "404.html"
)

echo "[smoke] checking required files"
for f in "${pages[@]}" "sitemap.xml" "robots.txt" "background.webp"; do
  [[ -f "$f" ]] || { echo "Missing file: $f"; exit 1; }
done

echo "[smoke] checking canonical tags"
for p in "${pages[@]}"; do
  if ! rg -q 'rel="canonical"' "$p"; then
    echo "Missing canonical: $p"
    exit 1
  fi
done

echo "[smoke] checking obsolete background references"
if rg -n 'background\.png' *.html site-theme.css >/dev/null; then
  echo "Found stale background.png reference"
  rg -n 'background\.png' *.html site-theme.css
  exit 1
fi

echo "[smoke] checking JSON-LD presence"
for p in index.html o-tymu.html uspechy.html eshop_tym_trampolin.html; do
  if ! rg -q 'application/ld\+json' "$p"; then
    echo "Missing structured data: $p"
    exit 1
  fi
done

echo "[smoke] OK"
