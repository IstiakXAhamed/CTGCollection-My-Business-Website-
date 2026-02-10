/**
 * CTG Collection - cPanel/Passenger Entry Point
 * 
 * CRITICAL: This file is the Application Startup File in cPanel Node.js Selector.
 * It starts Next.js as an in-process HTTP server — NO child processes, NO spawning.
 * 
 * Passenger will manage this as a single worker. Do NOT fight Passenger's process model.
 */

// 1. HARD LOCK: Must be set BEFORE any require() 
process.env.UV_THREADPOOL_SIZE = '1';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// 2. Suppress V8 extras
const v8 = require('v8');
v8.setFlagsFromString('--no-idle-notification');
v8.setFlagsFromString('--max-old-space-size=256');

console.log(`[PID ${process.pid}] NPROC Shield: UV_THREADPOOL=1, Prisma=library`);

// 3. Start Next.js IN-PROCESS (zero child processes)
const next = require('next');
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  // Keep-alive timeout — prevent dangling connections from holding threads
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 6000;

  server.listen(PORT, () => {
    console.log(`[PID ${process.pid}] Next.js ready on port ${PORT}`);
  });
}).catch((err) => {
  console.error('[FATAL] Next.js failed to start:', err);
  process.exit(1);
});

// 4. Graceful shutdown (only SIGTERM from Passenger)
process.on('SIGTERM', () => {
  console.log(`[PID ${process.pid}] SIGTERM received, shutting down...`);
  process.exit(0);
});
