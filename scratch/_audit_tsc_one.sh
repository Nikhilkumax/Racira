#!/usr/bin/env bash
# Phase 1 gate: typecheck one component file in project context.
# Usage: bash scratch/_audit_tsc_one.sh src/domains/calculator/components/Foo.tsx
set -u
TARGET="$1"
OUT=$(npx tsc --noEmit 2>&1)
CODE=$?
if [ "$CODE" -eq 0 ]; then
  echo "TSC EXIT 0 (project clean) — $TARGET passes with zero errors"
  exit 0
fi
# Filter to the target file (both / and \ separators)
FILT=$(printf '%s\n' "$OUT" | grep -F "$TARGET" || true)
if [ -z "$FILT" ]; then
  echo "TSC EXIT $CODE — errors exist but NONE in $TARGET. Filtered output:"
  printf '%s\n' "$OUT" | head -20
  exit 0
fi
echo "TSC EXIT $CODE — ERRORS IN $TARGET:"
printf '%s\n' "$FILT"
exit 1
