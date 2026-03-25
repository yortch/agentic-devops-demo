#!/bin/bash
# =============================================================================
# generate-load.sh — Generate light traffic against the deployed application
#
# Fetches frontend and backend URLs from azd env, then sends a steady stream
# of requests to simulate real user activity.
#
# IMPORTANT: Run this script from the repository root directory so that azd
# reads the app deployment environment (not the sre/ deployment environment).
#
#   cd /path/to/agentic-devops-demo
#   bash sre/scripts/generate-load.sh
#
# Usage:
#   bash sre/scripts/generate-load.sh              # Default: 5 req/s for 10 minutes
#   bash sre/scripts/generate-load.sh --rps 2      # 2 requests per second
#   bash sre/scripts/generate-load.sh --duration 5 # Run for 5 minutes
#   bash sre/scripts/generate-load.sh --forever    # Run until Ctrl+C
# =============================================================================
set -uo pipefail

# ── Defaults ─────────────────────────────────────────────────────────────────
RPS=5
DURATION_MIN=10
FOREVER=false

# ── Parse flags ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --rps)       RPS="$2"; shift 2 ;;
    --duration)  DURATION_MIN="$2"; shift 2 ;;
    --forever)   FOREVER=true; shift ;;
    -h|--help)
      echo "Usage: bash sre/scripts/generate-load.sh [--rps N] [--duration MINUTES] [--forever]"
      echo ""
      echo "Options:"
      echo "  --rps N        Requests per second (default: 5)"
      echo "  --duration N   Duration in minutes (default: 10)"
      echo "  --forever      Run until Ctrl+C"
      echo ""
      echo "NOTE: Run from the repository root so azd uses the app environment."
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

SLEEP_INTERVAL=$(awk "BEGIN {printf \"%.4f\", 1 / $RPS}")

# ── Resolve URLs from azd env ────────────────────────────────────────────────
FRONTEND_URL=$(azd env get-value frontend_uri 2>/dev/null || echo "")
BACKEND_URL=$(azd env get-value backend_uri 2>/dev/null || echo "")

if [ -z "$FRONTEND_URL" ]; then
  echo "❌ frontend_uri not found in azd env."
  echo "   Make sure you run this from the repository root (not sre/) so azd"
  echo "   reads the app deployment environment. Run 'azd up' if not deployed."
  exit 1
fi

if [ -z "$BACKEND_URL" ]; then
  echo "❌ backend_uri not found in azd env."
  echo "   Make sure you run this from the repository root (not sre/) so azd"
  echo "   reads the app deployment environment. Run 'azd up' if not deployed."
  exit 1
fi

echo ""
echo "============================================="
echo "  🔄 Load Generator — Three Rivers Bank"
echo "============================================="
echo ""
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend:  ${BACKEND_URL}"
echo "  Rate:     ${RPS} req/s"
if [ "$FOREVER" = "true" ]; then
  echo "  Duration: ∞ (Ctrl+C to stop)"
else
  echo "  Duration: ${DURATION_MIN} minutes"
fi
echo ""
echo "============================================="
echo ""

# ── Request paths to rotate through ─────────────────────────────────────────
PATHS=(
  "GET ${FRONTEND_URL}/"
  "GET ${FRONTEND_URL}/"
  "GET ${FRONTEND_URL}/"
  "GET ${BACKEND_URL}/api/cards"
  "GET ${BACKEND_URL}/api/cards"
  "GET ${BACKEND_URL}/api/cards/1"
  "GET ${BACKEND_URL}/api/cards/2"
  "GET ${BACKEND_URL}/api/cards/3"
  "GET ${BACKEND_URL}/api/cards/1/fees"
  "GET ${BACKEND_URL}/api/cards/2/fees"
  "GET ${BACKEND_URL}/api/cards/1/interest"
  "GET ${BACKEND_URL}/actuator/health"
)
PATH_COUNT=${#PATHS[@]}

# ── Counters ─────────────────────────────────────────────────────────────────
TOTAL=0
SUCCESS=0
ERRORS=0
START_TIME=$(date +%s)

if [ "$FOREVER" = "true" ]; then
  END_TIME=0
else
  END_TIME=$((START_TIME + DURATION_MIN * 60))
fi

# ── Cleanup on exit ──────────────────────────────────────────────────────────
cleanup() {
  ELAPSED=$(( $(date +%s) - START_TIME ))
  echo ""
  echo ""
  echo "============================================="
  echo "  📊 Load Test Summary"
  echo "============================================="
  echo ""
  echo "  Total requests: ${TOTAL}"
  echo "  Successful:     ${SUCCESS}"
  echo "  Errors:         ${ERRORS}"
  echo "  Duration:       ${ELAPSED}s"
  if [ "$ELAPSED" -gt 0 ]; then
    ACTUAL_RPS=$(awk "BEGIN {printf \"%.1f\", $TOTAL / $ELAPSED}")
    echo "  Actual rate:    ${ACTUAL_RPS} req/s"
  fi
  echo ""
  echo "============================================="
  exit 0
}
trap cleanup INT TERM

# ── Main loop ────────────────────────────────────────────────────────────────
echo "Sending requests... (Ctrl+C to stop)"
echo ""

while true; do
  NOW=$(date +%s)
  if [ "$FOREVER" = "false" ] && [ "$NOW" -ge "$END_TIME" ]; then
    break
  fi

  # Pick a random path
  IDX=$((RANDOM % PATH_COUNT))
  ENTRY="${PATHS[$IDX]}"
  METHOD="${ENTRY%% *}"
  URL="${ENTRY#* }"

  # Send request
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$URL" --max-time 10 2>/dev/null || echo "000")
  TOTAL=$((TOTAL + 1))

  if [[ "$HTTP_CODE" =~ ^2 ]]; then
    SUCCESS=$((SUCCESS + 1))
    ICON="✅"
  else
    ERRORS=$((ERRORS + 1))
    ICON="❌"
  fi

  # Print progress every 10 requests
  if [ $((TOTAL % 10)) -eq 0 ]; then
    ELAPSED=$(( NOW - START_TIME ))
    echo "  [${ELAPSED}s] ${ICON} ${TOTAL} requests sent (${SUCCESS} ok, ${ERRORS} err) — last: ${METHOD} ${URL##*/} → ${HTTP_CODE}"
  fi

  sleep "$SLEEP_INTERVAL"
done

cleanup
