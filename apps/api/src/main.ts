import { buildApp } from './app.js';
import { loadApiEnv } from './env.js';

const env = loadApiEnv();
const app = buildApp({ logger: { level: env.LOG_LEVEL } });

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
