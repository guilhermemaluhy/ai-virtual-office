import { type LlmProvider, OfflineProvider } from '@aivo/ai';
import type { Database } from '@aivo/db';
import cors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { agentRoutes } from './routes/agents.js';
import { agentWorkRoutes } from './routes/agents-work.js';
import { approvalRoutes } from './routes/approvals.js';
import { catalogRoutes } from './routes/catalog.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { taskRoutes } from './routes/tasks.js';

export interface AppOptions extends FastifyServerOptions {
  db: Database;
  /** Injectable clock for tests. */
  now?: () => Date;
  /** Answers agent chats; offline (rule-based) by default. */
  llm?: LlmProvider;
  /** Origins allowed to call the API from a browser (the web app). */
  corsOrigins?: string[];
}

export function buildApp({
  db,
  now = () => new Date(),
  corsOrigins = [],
  llm = new OfflineProvider(),
  ...options
}: AppOptions): FastifyInstance {
  const app = Fastify(options);

  void app.register(cors, { origin: corsOrigins });

  app.get('/health', () => ({ status: 'ok' as const }));

  agentRoutes(app, db);
  catalogRoutes(app, db);
  dashboardRoutes(app, db, now);
  approvalRoutes(app, db, now);
  taskRoutes(app, db);
  agentWorkRoutes(app, db, llm, now);

  return app;
}
