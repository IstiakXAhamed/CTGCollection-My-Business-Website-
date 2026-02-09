/**
 * NPROC Survival Guard - Master Class
 * This file MUST be imported as the absolute first line in any entry file.
 * It forces the Node.js process into a single-threaded mode to satisfy CloudLinux NPROC limits.
 */
if (typeof process !== 'undefined') {
  // Skip hardening during build phase to prevent SIGABRT/deadlocks 
  // Next.js static generation often needs threads for parallel DB/API calls
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.NODE_PHASE === 'test' ||
                  (process.argv && process.argv.includes('build'));

  if (!isBuild) {
    // Lock Libuv threadpool to 1 before any native code is loaded
    process.env.UV_THREADPOOL_SIZE = '1';
    
    // Force Prisma to use the library engine (in-process)
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    
    // Disable Next.js telemetry to prevent background process calls
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    
    /* console.log('🛡️ NPROC Guard: Single-Thread Mode Active'); */
  }
}
export {};
