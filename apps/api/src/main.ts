import { createDatabase } from '@aivo/db';
import { buildApp } from './app.js';
import { loadApiEnv } from './env.js';

const env = loadApiEnv();
const connection = createDatabase(env.DATABASE_URL);
const app = buildApp({ db: connection.db, logger: { level: env.LOG_LEVEL } });
app.addHook('onClose', () => connection.close());

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
