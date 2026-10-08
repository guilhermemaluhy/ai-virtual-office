import { type Database, tasks } from '@aivo/db';
import { TASK_STATUSES } from '@aivo/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../validation.js';

const listQuery = z.object({
  agentId: z.string().optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

export function taskRoutes(app: FastifyInstance, db: Database) {
  app.get('/tasks', async (request, reply) => {
    const query = parseOrReply(listQuery, request.query, reply);
    if (!query) return;
    const filters: SQL[] = [];
    if (query.agentId) filters.push(eq(tasks.agentId, query.agentId));
    if (query.status) filters.push(eq(tasks.status, query.status));
    return db
      .select()
      .from(tasks)
      .where(and(...filters))
      .orderBy(desc(tasks.createdAt));
  });
}
