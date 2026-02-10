#!/bin/bash
# Passenger-Friendly Restart Script for CTG Collection
# Run: bash ~/restart-app.sh
#
# Uses Passenger's built-in restart mechanism instead of pkill.
# cPanel's Passenger will gracefully stop the old process and start a new one.

set -e

LIVE_DIR=~/ctg-collection

echo "♻️ Restarting app via Passenger..."
mkdir -p "$LIVE_DIR/tmp"
touch "$LIVE_DIR/tmp/restart.txt"

echo "⏳ Waiting 15 seconds for Passenger to recycle the process..."
sleep 15

echo "📊 Current Node processes:"
ps -eo pid,nlwp,rss,comm --no-headers | grep "node" || echo "  (none found — Passenger may still be starting)"

TOTAL=$(ps -eo pid --no-headers | grep -c "node" 2>/dev/null || echo "0")
echo ""
echo "📈 Total Node processes: $TOTAL"

if [ "$TOTAL" -gt 3 ]; then
  echo "⚠️  WARNING: More than 3 Node processes detected!"
  echo "   If this persists, contact Hostnin support."
fi

echo "✅ Restart complete!"
