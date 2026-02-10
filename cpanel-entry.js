/**
 * CTG Collection - cPanel/Passenger Entry Point
 * 
 * CRITICAL: This is the Application Startup File in cPanel Node.js Selector.
 * Starts Next.js as a SINGLE-WORKER in-process HTTP server.
 * Handles graceful shutdown to prevent orphan next-server processes.
 */

// =====================================================
// 1. HARD LOCK: Must be set BEFORE any require()
// =====================================================
process.env.UV_THREADPOOL_SIZE = '1';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Force single worker
process.env.NEXT_EXPERIMENTAL_CPUS = '1';
process.env.__NEXT_PRIVATE_CPUS = '1';

// =====================================================
// 2. REDUCE V8 THREADS
// =====================================================
const v8 = require('v8');
v8.setFlagsFromString('--max-old-space-size=256');
v8.setFlagsFromString('--single-threaded');
v8.setFlagsFromString('--predictable');
v8.setFlagsFromString('--no-concurrent-recompilation');
v8.setFlagsFromString('--no-concurrent-sweeping');
v8.setFlagsFromString('--no-parallel-compaction');
v8.setFlagsFromString('--no-concurrent-marking');

// =====================================================
// 3. FORCE os.cpus() TO RETURN 1 CPU
// =====================================================
const os = require('os');
const originalCpus = os.cpus;
os.cpus = function() {
  const cpus = originalCpus.call(os);
  return cpus.length > 0 ? [cpus[0]] : [{ model: 'cpu', speed: 2000, times: {} }];
};

console.log(`[PID ${process.pid}] NPROC Shield: UV_POOL=1, CPUs=1, V8=single-threaded`);

// =====================================================
// 4. KILL ANY ORPHAN next-server PROCESSES FROM PREVIOUS RUNS
//    This prevents zombie accumulation across restarts
// =====================================================
const { execSync } = require('child_process');
try {
  // Kill any leftover next-server processes owned by this user
  // Uses -f to match against full command line
  execSync('pkill -f "next-server" 2>/dev/null || true', { stdio: 'ignore' });
  console.log(`[PID ${process.pid}] Cleaned orphan next-server processes`);
} catch (e) {
  // pkill not available or no processes to kill — that's fine
}

// Wait a moment for processes to die
const waitSync = (ms) => { const end = Date.now() + ms; while (Date.now() < end) {} };
waitSync(500);

// =====================================================
// 5. START NEXT.JS IN-PROCESS
// =====================================================
const next = require('next');
const http = require('http');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = next({ 
  dev: false, 
  dir: __dirname,
  conf: {
    experimental: {
      cpus: 1,
      workerThreads: false,
    }
  }
});
const handle = app.getRequestHandler();

let httpServer = null;

app.prepare().then(() => {
  httpServer = http.createServer((req, res) => {
    handle(req, res);
  });

  httpServer.keepAliveTimeout = 5000;
  httpServer.headersTimeout = 6000;
  httpServer.maxConnections = 50;

  httpServer.listen(PORT, () => {
    console.log(`[PID ${process.pid}] Next.js ready on port ${PORT}`);
  });
}).catch((err) => {
  console.error('[FATAL] Next.js failed to start:', err);
  process.exit(1);
});

// =====================================================
// 6. GRACEFUL SHUTDOWN — Kill ALL child processes
//    This prevents orphan next-server zombies
// =====================================================
function gracefulShutdown(signal) {
  console.log(`[PID ${process.pid}] ${signal} received, cleaning up...`);
  
  // Close HTTP server first
  if (httpServer) {
    httpServer.close();
  }
  
  // Kill entire process group to ensure child processes die
  try {
    process.kill(-process.pid, 'SIGTERM');
  } catch (e) {
    // Not a process group leader — try killing children via pkill
    try {
      execSync(`pkill -P ${process.pid} 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (e2) {}
  }
  
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
