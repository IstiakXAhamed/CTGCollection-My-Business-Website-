#!/bin/bash
# Nuclear Restart Script for NPROC Management
# Run: bash ~/restart-app.sh
# This script does a CLEAN restart — kills ALL processes, then starts fresh

set -e
export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH

echo "🔴 Nuclear restart initiated..."

# 1. Kill ALL next-server processes (the biggest NPROC consumer)
echo "💀 Killing all next-server processes..."
pkill -u $(whoami) -9 -f "next-server" 2>/dev/null || true
sleep 1

# 2. Kill any leftover node processes EXCEPT this script's bash
echo "💀 Killing all node processes..."  
pkill -u $(whoami) -9 -f "node " 2>/dev/null || true
sleep 1

# 3. Double check — force kill anything left
echo "🔍 Verifying cleanup..."
REMAINING=$(ps -eo pid,comm --no-headers | grep -E "next-server|node" | grep -v grep | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  $REMAINING processes still alive, force killing..."
    ps -eo pid,comm --no-headers | grep -E "next-server|node" | grep -v grep | awk '{print $1}' | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 4. Restart the app via Passenger
echo "🚀 Restarting app via Passenger..."
cd ~/silkmart
mkdir -p tmp
touch tmp/restart.txt

# 5. Wait for startup
echo "⏳ Waiting for app to start (15 seconds)..."
sleep 15

# 6. Report
echo ""
echo "📊 Current process status:"
ps -eo nlwp,pid,comm --no-headers | sort -rn | head -10
echo ""
TOTAL_THREADS=$(ps -eo nlwp --no-headers | awk '{sum+=$1} END {print sum}')
echo "📈 Total threads: $TOTAL_THREADS"
echo ""
echo "✅ Restart complete!"
