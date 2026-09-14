#!/usr/bin/env bash
# Usage: bash _scripts/check-live-routes.sh [START_INDEX] [END_INDEX]
# Verifies the wired calculators render as tools (HTTP 200, real calculator
# markup) instead of the Coming Soon template. Starts/stops the dev server.
cd "$(dirname "$0")/.." || exit 1

PORT=3002
LOG=_scripts/dev-3002.log
START=${1:-0}
END=${2:-1000}

npx next dev -p $PORT > "$LOG" 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

# Wait for the dev server to answer
READY=0
for _ in $(seq 1 90); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:$PORT/calculator 2>/dev/null)
  if [ "$CODE" = "200" ]; then READY=1; break; fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  echo "DEV SERVER DID NOT COME UP"; tail -30 "$LOG"; exit 1
fi
echo "dev server up (pid $DEV_PID) — checking routes $START..$END"

PASS=0; FAIL=0; IDX=0
while IFS= read -r LINE; do
  SLUG="${LINE%% — *}"
  if [ "$IDX" -lt "$START" ] || [ "$IDX" -gt "$END" ]; then IDX=$((IDX+1)); continue; fi
  IDX=$((IDX+1))
  CODE=$(curl -s -o /tmp/_racira_page.html -w '%{http_code}' --max-time 180 "http://127.0.0.1:$PORT/calculator/$SLUG")
  if [ "$CODE" = "200" ]; then
    if grep -q 'Coming Soon' /tmp/_racira_page.html; then
      echo "COMING-SOON $SLUG (http 200 but Coming Soon template)"
      FAIL=$((FAIL+1))
    elif grep -q 'Calculate' /tmp/_racira_page.html; then
      echo "OK   $SLUG"
      PASS=$((PASS+1))
    else
      echo "NO-CALC $SLUG (http 200, no Coming Soon, but no calculator markup)"
      FAIL=$((FAIL+1))
    fi
  else
    echo "HTTP-$CODE $SLUG"
    FAIL=$((FAIL+1))
  fi
done < <(cut -d' ' -f1 status_rebuild.txt)

echo "────────────────────────────"
echo "PASS=$PASS FAIL=$FAIL (range $START..$END)"
[ "$FAIL" -eq 0 ]
