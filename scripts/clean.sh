#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=0
if [[ "${1:-}" == "-n" || "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

paths=(
  "node_modules"
  ".next"
  ".turbo"
  "dist"
  "build"
  "coverage"
  ".cache"
  "playwright-report"
  "test-results"
  "src/generated"
  "tsconfig.tsbuildinfo"
  "prisma/dev.db"
  "prisma/prisma"
)

for p in "${paths[@]}"; do
  if [[ -e "$p" ]]; then
    # Skip cornerstone index and uploads directory entirely
    if [[ "$p" == public/uploads* ]]; then
      continue
    fi
    if [[ $DRY_RUN -eq 1 ]]; then
      echo "[dry-run] rm -rf $p"
    else
      rm -rf "$p"
      echo "removed: $p"
    fi
  fi
done
