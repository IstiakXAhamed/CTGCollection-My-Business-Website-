/**
 * CTG Collection - NPROC Hardening Entry Point (cPanel/Passenger)
 * 
 * This file MUST be set as the 'Application Startup File' in cPanel Node.js Selector.
 * It locks environment variables BEFORE Next.js loads, then starts the server.
 */

// 1. HARD LOCK: Environment variables (must be set before ANY require)
process.env.UV_THREADPOOL_SIZE = '1';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

console.log('🛡️  NPROC Shield Active: UV_THREADPOOL_SIZE=1, Prisma=library engine');

// 2. INSTANCE LOCK: Prevent duplicate instances via lockfile
const fs = require('fs');
const path = require('path');
const lockFile = path.join(__dirname, '.server.lock');

// Check for stale lock
if (fs.existsSync(lockFile)) {
  try {
    const lockPid = parseInt(fs.readFileSync(lockFile, 'utf8').trim());
    // Check if that PID is actually running
    try {
      process.kill(lockPid, 0); // Signal 0 = existence check, doesn't kill
      console.error(`❌ Another instance is running (PID ${lockPid}). Exiting.`);
      process.exit(1);
    } catch (e) {
      // PID doesn't exist — stale lock, safe to continue
      console.log('⚠️  Stale lock file found, cleaning up...');
    }
  } catch (e) {
    // Can't read lock file — delete and continue
  }
}

// Write our PID
fs.writeFileSync(lockFile, String(process.pid));
console.log(`🔒 Instance lock acquired (PID ${process.pid})`);

// Clean up lock on exit
function cleanLock() {
  try { fs.unlinkSync(lockFile); } catch(e) {}
}
process.on('exit', cleanLock);
process.on('SIGTERM', () => { cleanLock(); process.exit(0); });
process.on('SIGINT', () => { cleanLock(); process.exit(0); });

// 3. START NEXT.JS (Standard mode — no standalone)
console.log('🚀 Starting Next.js production server...');

// Use Next.js CLI start which handles everything correctly
const { execSync } = require('child_process');
const PORT = process.env.PORT || 3000;

// Start next directly — this is what `npm start` does
try {
  require('next/dist/bin/next');
} catch (e) {
  // Fallback: use the next CLI directly
  console.log('Starting via next start CLI...');
  const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
  if (fs.existsSync(nextBin)) {
    require('child_process').spawn(nextBin, ['start', '-p', String(PORT)], {
      stdio: 'inherit',
      env: process.env
    });
  } else {
    console.error('❌ Cannot find next binary. Run npm install first.');
    process.exit(1);
  }
}
