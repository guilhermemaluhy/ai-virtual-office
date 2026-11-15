import type { Database } from '@aivo/db';
import cors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { statusRoutes } from './routes/status.js';

export interface AppOptions extends FastifyServerOptions {
  db: Database;
  /** Origins allowed to call the API from a browser (the web app). */
  corsOrigins?: string[];
}

/**
 * Fase 2: the API only reports health and the office status. Bling, employees and
 * approvals arrive in the next phases. The web talks to Supabase directly for the
 * owner's own data (RLS); this API runs on the VPS with the service role.
 */
export function buildApp({ db, corsOrigins = [], ...options }: AppOptions): FastifyInstance {
  const app = Fastify(options);

  void app.register(cors, { origin: corsOrigins });

  app.get('/health', () => ({ status: 'ok' as const }));

  statusRoutes(app, db);

  return app;
}
