import { loadWorkerEnv } from './env.js';
import { startWorker } from './worker.js';

const env = loadWorkerEnv();

const worker = startWorker(() => {
  if (env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace') {
    console.debug(`[worker] tick ${new Date().toISOString()}`);
  }
  return Promise.resolve();
}, env.WORKER_TICK_MS);

console.info(`[worker] started (tick every ${String(env.WORKER_TICK_MS)}ms)`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void worker.stop().then(() => {
      console.info(`[worker] stopped (${signal})`);
      process.exit(0);
    });
  });
}
