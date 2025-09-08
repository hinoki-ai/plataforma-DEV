#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
FILE="$ROOT/.protected-paths"
[ -f "$FILE" ] || { echo "No .protected-paths found"; exit 0; }

target="${1:-}"

unlock_one() {
  local p="$1"
  local abs="$ROOT/$p"
  if [ -e "$abs" ]; then
    if sudo -n chattr -i "$abs" 2>/dev/null || sudo chattr -i "$abs"; then
      echo "Unlocked immutable: $p"
    else
      echo "Failed to unlock (need sudo?): $p"
      return 1
    fi
  fi
}

if [[ -n "$target" ]]; then
  unlock_one "$target"
else
  while IFS= read -r path || [ -n "$path" ]; do
    [[ -z "$path" || "$path" =~ ^# ]] && continue
    unlock_one "$path"
  done < "$FILE"
fi
