import { applyAction, refreshAgentStates } from '@aivo/agents';
import { approvals, auditLog, type Database } from '@aivo/db';
import { APPROVAL_STATUSES, CEO_ACTOR } from '@aivo/shared';
import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../validation.js';

const listQuery = z.object({ status: z.enum(APPROVAL_STATUSES).optional() });
const idParams = z.object({ id: z.uuid() });
const decisionBody = z.object({
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(1000).optional(),
});

export function approvalRoutes(app: FastifyInstance, db: Database, now: () => Date) {
  app.get('/approvals', async (request, reply) => {
    const query = parseOrReply(listQuery, request.query, reply);
    if (!query) return;
    return db
      .select()
      .from(approvals)
      .where(query.status ? eq(approvals.status, query.status) : undefined)
      .orderBy(desc(approvals.createdAt));
  });

  /** The CEO approves or rejects a pending request; approved actions run right away. Audited. */
  app.post('/approvals/:id/decision', async (request, reply) => {
    const params = parseOrReply(idParams, request.params, reply);
    if (!params) return;
    const body = parseOrReply(decisionBody, request.body, reply);
    if (!body) return;

    const result = await db.transaction(async (tx) => {
      const [before] = await tx.select().from(approvals).where(eq(approvals.id, params.id));
      if (!before) return { status: 404 as const };

      const [after] = await tx
        .update(approvals)
        .set({
          status: body.decision,
          decidedBy: CEO_ACTOR,
          decisionNote: body.note ?? null,
          decidedAt: now(),
        })
        .where(and(eq(approvals.id, params.id), eq(approvals.status, 'pending')))
        .returning();
      if (!after) return { status: 409 as const, current: before.status };

      await tx.insert(auditLog).values({
        actor: CEO_ACTOR,
        action: `approval.${body.decision}`,
        entity: 'approval',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status, note: after.decisionNote },
      });
      if (after.status === 'approved') {
        await applyAction(
          tx,
          {
            action: after.action,
            payload: after.payload,
            summary: after.summary,
            requestedBy: after.requestedBy,
          },
          CEO_ACTOR,
          now(),
        );
      }
      await refreshAgentStates(tx, [after.requestedBy]);
      return { status: 200 as const, approval: after };
    });

    if (result.status === 404) return reply.code(404).send({ error: 'Not Found' });
    if (result.status === 409) {
      return reply
        .code(409)
        .send({ error: 'Conflict', message: `Approval is already ${result.current}` });
    }
    return result.approval;
  });
}
