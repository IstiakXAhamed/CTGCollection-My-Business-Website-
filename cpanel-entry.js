/**
 * CTG Collection - NPROC Hardening Entry Point (cPanel/Passenger)
 * 
 * WHY THIS EXISTS:
 * Next.js and its dependencies (like Prisma/Libuv) read certain environment 
 * variables (like UV_THREADPOOL_SIZE) ONLY ONCE during their initial load.
 * Loading these in 'middleware' or 'lib' files is often "too late".
 * 
 * This file MUST be set as the 'Application Startup File' in the cPanel Node.js Selector.
 */

// 1. HARD LOCK: Threadpool Size = 1
// Only apply in production runtime, not during build/static-gen
if (!process.env.NEXT_PHASE?.includes('build')) {
    process.env.UV_THREADPOOL_SIZE = '1';
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    console.log('🛡️  NPROC Shield Active: Forced Single-Thread Mode');
}

// 4. OS LOGGING
console.log('🚀 Initializing Next.js Standalone Server...');

/**
 * 5. LOAD STANDALONE SERVER
 * When Next.js builds with 'output: standalone', it creates a server.js file.
 * We bridge to it here so our ENV locks are already in memory.
 */
const path = require('path');
const fs = require('fs');

// Path to the standalone server relative to root
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(serverPath)) {
    require(serverPath);
} else {
    // Fallback for development or non-standalone builds
    console.warn('⚠️  Standalone server not found. Attempting production start...');
    require('next/dist/server/next-server');
}
