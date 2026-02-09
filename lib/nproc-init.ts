/**
 * NPROC Survival Guard - Master Class
 * This file MUST be imported as the absolute first line in any entry file.
 * It forces the Node.js process into a single-threaded mode to satisfy CloudLinux NPROC limits.
 */
if (typeof process !== 'undefined' && process.env) {
  // Use a heuristic to detect build phase that works in both main and worker processes
  const isBuild = 
    process.env.NEXT_PHASE === 'phase-production-build' || 
    process.env.NODE_PHASE === 'test' ||
    (process.env.NODE_ENV === 'production' && !process.env.UV_THREADPOOL_SIZE && !process.env.NEXT_RUNTIME) ||
    (process.argv && process.argv.some(arg => arg.includes('next-build') || arg === 'build'));

  if (!isBuild && !process.env.NEXT_RUNTIME) {
    // Lock Libuv threadpool to 1 before any native code is loaded
    // This is for PRODUCTION RUNTIME only.
    process.env.UV_THREADPOOL_SIZE = '1';
    
    // Force Prisma to use the library engine (in-process)
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    
    // Disable Next.js telemetry
    process.env.NEXT_TELEMETRY_DISABLED = '1';
  }
}
export {};
