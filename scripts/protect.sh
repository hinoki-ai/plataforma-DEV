#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
FILE="$ROOT/.protected-paths"
[ -f "$FILE" ] || { echo "No .protected-paths found"; exit 0; }
while IFS= read -r path || [ -n "$path" ]; do
  [[ -z "$path" || "$path" =~ ^# ]] && continue
  abs="$ROOT/$path"
  if [ -f "$abs" ]; then
    if sudo -n chattr +i "$abs" 2>/dev/null || sudo chattr +i "$abs"; then
      echo "Locked immutable: $path"
    else
      echo "Failed to lock (need sudo?): $path"
    fi
  else
    echo "Skip (not a regular file): $path"
  fi
done < "$FILE"
