#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
FILE="$ROOT/.protected-paths"
[ -f "$FILE" ] || { echo "No .protected-paths found"; exit 0; }
missing=0
while IFS= read -r path || [ -n "$path" ]; do
  [[ -z "$path" || "$path" =~ ^# ]] && continue
  if [ ! -e "$ROOT/$path" ]; then
    echo "Missing protected path: $path"
    missing=1
  fi
done < "$FILE"
exit $missing
