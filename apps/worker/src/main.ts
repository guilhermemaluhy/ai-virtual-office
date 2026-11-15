import { createDatabase } from '@aivo/db';
import { loadWorkerEnv } from './env.js';
import { runTick } from './tick.js';
import { startWorker } from './worker.js';

const env = loadWorkerEnv();
const connection = createDatabase(env.DATABASE_URL);
let lastOutcome: string | undefined;

const worker = startWorker(async () => {
  const outcome = await runTick(connection.db);
  if (outcome !== lastOutcome) {
    console.info(
      outcome === 'paused'
        ? '[worker] escritório pausado pelo dono; nada roda até ele retomar'
        : '[worker] escritório ativo; sem funcionários contratados ainda',
    );
    lastOutcome = outcome;
  }
}, env.WORKER_TICK_MS);

console.info(`[worker] started (tick every ${String(env.WORKER_TICK_MS)}ms)`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void worker
      .stop()
      .then(() => connection.close())
      .then(() => {
        console.info(`[worker] stopped (${signal})`);
        process.exit(0);
      });
  });
}
