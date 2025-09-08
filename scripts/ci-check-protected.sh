#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
FILE="$ROOT/.protected-paths"
[ -f "$FILE" ] || exit 0
while IFS= read -r path || [ -n "$path" ]; do
  [[ -z "$path" || "$path" =~ ^# ]] && continue
  [ -e "$ROOT/$path" ] || { echo "Missing protected $path"; exit 1; }
done < "$FILE"
