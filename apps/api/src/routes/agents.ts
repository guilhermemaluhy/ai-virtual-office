import { agents, type AgentRow, type Database, tasks } from '@aivo/db';
import { asc, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../validation.js';

export interface OrgNode extends AgentRow {
  reports: OrgNode[];
}

export function buildOrgTree(rows: AgentRow[], managerId: string | null = null): OrgNode[] {
  return rows
    .filter((row) => row.reportsTo === managerId)
    .map((row) => ({ ...row, reports: buildOrgTree(rows, row.id) }));
}

export function agentRoutes(app: FastifyInstance, db: Database) {
  app.get('/agents', () => db.select().from(agents).orderBy(asc(agents.id)));

  app.get('/org-chart', async () => {
    const rows = await db.select().from(agents);
    return { ceo: { id: 'ceo', title: 'CEO', reports: buildOrgTree(rows) } };
  });

  app.get('/agents/:id', async (request, reply) => {
    const params = parseOrReply(z.object({ id: z.string() }), request.params, reply);
    if (!params) return;
    const [agent] = await db.select().from(agents).where(eq(agents.id, params.id));
    if (!agent) return reply.code(404).send({ error: 'Not Found' });
    const agentTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.agentId, agent.id))
      .orderBy(desc(tasks.createdAt));
    return { ...agent, tasks: agentTasks };
  });
}
