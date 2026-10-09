#!/usr/bin/env bash
# Print the logic portion (everything before the top-level component return) of legacy calculators.
cd "$(dirname "$0")/../src/domains/calculator/components" || exit 1
for f in "$@"; do
  echo "===== $f ====="
  awk '/^  return \(/ { exit } { print }' "$f"
done
