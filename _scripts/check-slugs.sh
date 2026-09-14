#!/usr/bin/env bash
# Usage: bash _scripts/check-slugs.sh slug1 slug2 ...
# Verifies calculators render as tools (HTTP 200, real calculator markup,
# no Coming Soon template). Starts/stops the dev server itself.
cd "$(dirname "$0")/.." || exit 1

PORT=3002
LOG=_scripts/dev-3002.log
SLUGS=("$@")

npx next dev -p $PORT > "$LOG" 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

READY=0
for _ in $(seq 1 90); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:$PORT/calculator 2>/dev/null)
  if [ "$CODE" = "200" ]; then READY=1; break; fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  echo "DEV SERVER DID NOT COME UP"; tail -30 "$LOG"; exit 1
fi
echo "dev server up (pid $DEV_PID) — checking ${#SLUGS[@]} routes"

PASS=0; FAIL=0
for SLUG in "${SLUGS[@]}"; do
  CODE=$(curl -s -o /tmp/_racira_page.html -w '%{http_code}' --max-time 180 "http://127.0.0.1:$PORT/calculator/$SLUG")
  if [ "$CODE" = "200" ]; then
    if grep -q 'Coming Soon' /tmp/_racira_page.html; then
      echo "COMING-SOON $SLUG"
      FAIL=$((FAIL+1))
    elif grep -q 'Calculate' /tmp/_racira_page.html; then
      echo "OK   $SLUG"
      PASS=$((PASS+1))
    else
      echo "NO-CALC $SLUG"
      FAIL=$((FAIL+1))
    fi
  else
    echo "HTTP-$CODE $SLUG"
    FAIL=$((FAIL+1))
  fi
done

echo "────────────────────────────"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
