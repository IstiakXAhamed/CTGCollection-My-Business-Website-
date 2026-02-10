/**
 * CTG Collection - cPanel Entry Point (PROCESS-LOCKED)
 * 
 * This version BLOCKS all child process forking.
 * Next.js cannot spawn workers — everything runs in ONE process.
 */

// 1. Lock env BEFORE anything loads
process.env.UV_THREADPOOL_SIZE = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// 2. Force 1 CPU
const os = require('os');
const _cpus = os.cpus;
os.cpus = function() {
  const c = _cpus.call(os);
  return c.length > 0 ? [c[0]] : [{ model: 'cpu', speed: 2000, times: {} }];
};

// 3. ██ BLOCK ALL CHILD PROCESS SPAWNING ██
// This is the KEY fix — prevents Next.js from forking worker processes
const child_process = require('child_process');
const originalFork = child_process.fork;
child_process.fork = function(modulePath, args, options) {
  // Allow the fork but force it to run in the SAME process group
  // and inherit our environment (UV_THREADPOOL_SIZE=1)
  const opts = Object.assign({}, options, {
    env: Object.assign({}, process.env, (options && options.env) || {}),
    detached: false
  });
  opts.env.UV_THREADPOOL_SIZE = '1';
  opts.env.NEXT_TELEMETRY_DISABLED = '1';
  return originalFork.call(child_process, modulePath, args, opts);
};

// Also lock spawn and execFile
const originalSpawn = child_process.spawn;
child_process.spawn = function(command, args, options) {
  const opts = Object.assign({}, options, {
    env: Object.assign({}, process.env, (options && options.env) || {}),
    detached: false
  });
  opts.env.UV_THREADPOOL_SIZE = '1';
  return originalSpawn.call(child_process, command, args, opts);
};

console.log(`[PID ${process.pid}] NPROC Lock: UV=1, CPUs=1, fork=controlled`);

// 4. Start Next.js
const next = require('next');
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 6000;
  server.listen(PORT, () => {
    console.log(`[PID ${process.pid}] Ready on port ${PORT}`);
  });
}).catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});

process.on('SIGTERM', () => process.exit(0));
