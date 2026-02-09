/**
 * NPROC Survival Guard - Master Class
 * This file MUST be imported as the absolute first line in any entry file.
 * It forces the Node.js process into a single-threaded mode to satisfy CloudLinux NPROC limits.
 */
if (typeof process !== 'undefined' && process.env) {
  // Simpler, more robust build check
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                  process.env.NODE_PHASE === 'test' ||
                  process.env.CI === 'true';

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
