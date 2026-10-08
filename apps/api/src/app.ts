import type { Database } from '@aivo/db';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { agentRoutes } from './routes/agents.js';
import { approvalRoutes } from './routes/approvals.js';
import { catalogRoutes } from './routes/catalog.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { taskRoutes } from './routes/tasks.js';

export interface AppOptions extends FastifyServerOptions {
  db: Database;
  /** Injectable clock for tests. */
  now?: () => Date;
}

export function buildApp({ db, now = () => new Date(), ...options }: AppOptions): FastifyInstance {
  const app = Fastify(options);

  app.get('/health', () => ({ status: 'ok' as const }));

  agentRoutes(app, db);
  catalogRoutes(app, db);
  dashboardRoutes(app, db, now);
  approvalRoutes(app, db, now);
  taskRoutes(app, db);

  return app;
}
