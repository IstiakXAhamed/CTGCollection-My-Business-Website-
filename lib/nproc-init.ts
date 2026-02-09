/**
 * NPROC Survival Guard - Master Class
 * This file MUST be imported as the absolute first line in any entry file.
 * It forces the Node.js process into a single-threaded mode to satisfy CloudLinux NPROC limits.
 */
if (typeof process !== 'undefined' && process.env) {
  // Absolute exclusion for BUILD and WORKER threads
  // Static page generation (Workers) must have their own thread management
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.CI === 'true' ||
                  process.env.NODE_ENV === 'test';
                  
  const isWorker = process.env.NEXT_IS_EXPORT_WORKER === 'true' || 
                   process.env.NEXT_RUNTIME === 'edge' ||
                   process.env.__NEXT_PRIVATE_PREBUNDLED_REACT === 'true' ||
                   (process.env.UV_THREADPOOL_SIZE && process.env.UV_THREADPOOL_SIZE !== '1'); // Don't override if already set

  if (!isBuild && !isWorker) {
    // Lock Libuv threadpool to 1 before any native code is loaded
    // PRODUCTION RUNTIME ONLY - NEVER BUILD
    process.env.UV_THREADPOOL_SIZE = '1';
    
    // Force Prisma to use the library engine (in-process)
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    
    // Disable Next.js telemetry
    process.env.NEXT_TELEMETRY_DISABLED = '1';
  }
}
export {};
