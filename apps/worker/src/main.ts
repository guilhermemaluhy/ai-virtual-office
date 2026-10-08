import { runCycle } from '@aivo/agents';
import { createDatabase } from '@aivo/db';
import { loadWorkerEnv } from './env.js';
import { startWorker } from './worker.js';

const env = loadWorkerEnv();
const connection = createDatabase(env.DATABASE_URL);

const cycle = async () => {
  const summary = await runCycle(connection.db);
  console.info(
    `[worker] ciclo: ${String(summary.tasksCreated)} tarefas, ${String(summary.approvalsRequested)} aprovações, ${String(summary.actionsExecuted)} ações executadas`,
  );
};

const worker = startWorker(cycle, env.AGENT_CYCLE_MS);
console.info(`[worker] started (agent cycle every ${String(env.AGENT_CYCLE_MS / 1000)}s)`);
void cycle().catch(console.error);

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
