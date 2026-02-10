/**
 * CTG Collection — cPanel / Passenger Entry Point
 * 
 * cPanel is configured to start this file (`app.js`) via Passenger.
 * All NPROC protections are built-in so Next.js cannot spawn excess processes.
 *
 * DO NOT rename this file — cPanel expects exactly "app.js".
 */

// ─── 1. Lock environment BEFORE anything else loads ───
process.env.UV_THREADPOOL_SIZE = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// ─── 2. Force single CPU visibility ───
const os = require('os');
const _cpus = os.cpus;
os.cpus = function () {
  const c = _cpus.call(os);
  return c.length > 0 ? [c[0]] : [{ model: 'cpu', speed: 2000, times: {} }];
};

// ─── 3. Control child process spawning ───
// Prevents Next.js from forking workers with unrestricted env
const child_process = require('child_process');

const originalFork = child_process.fork;
child_process.fork = function (modulePath, args, options) {
  const opts = Object.assign({}, options, {
    env: Object.assign({}, process.env, (options && options.env) || {}),
    detached: false,
  });
  opts.env.UV_THREADPOOL_SIZE = '1';
  opts.env.NEXT_TELEMETRY_DISABLED = '1';
  return originalFork.call(child_process, modulePath, args, opts);
};

const originalSpawn = child_process.spawn;
child_process.spawn = function (command, args, options) {
  const opts = Object.assign({}, options, {
    env: Object.assign({}, process.env, (options && options.env) || {}),
    detached: false,
  });
  opts.env.UV_THREADPOOL_SIZE = '1';
  return originalSpawn.call(child_process, command, args, opts);
};

console.log(`[PID ${process.pid}] NPROC Lock: UV=1, CPUs=1, fork=controlled`);

// ─── 4. Start Next.js ───
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Keep-alive tuning for shared hosting
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 6000;

  server.listen(port, () => {
    console.log(`[PID ${process.pid}] Ready on port ${port}`);
  });
}).catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});

// ─── 5. Graceful shutdown & crash protection ───
process.on('SIGTERM', () => {
  console.log('[PID ' + process.pid + '] SIGTERM received, shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[PID ' + process.pid + '] SIGINT received, shutting down...');
  process.exit(0);
});
process.on('uncaughtException', (err) => {
  console.error('[PID ' + process.pid + '] Uncaught Exception:', err);
  // Let Passenger restart us cleanly instead of leaving a zombie
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[PID ' + process.pid + '] Unhandled Rejection:', reason);
});
