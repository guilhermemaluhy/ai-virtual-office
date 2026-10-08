import {
  type AgentRow,
  agents,
  approvals,
  auditLog,
  type Database,
  listings,
  products,
  tasks,
} from '@aivo/db';
import type { AgentState } from '@aivo/shared';
import { ACTIONS, routeAction } from '@aivo/tools';
import { and, eq, gte, inArray, isNotNull } from 'drizzle-orm';
import { analyzeStore } from './analyzers.js';
import { applyAction } from './executor.js';
import type { Proposal } from './types.js';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface CycleSummary {
  tasksCreated: number;
  approvalsRequested: number;
  actionsExecuted: number;
  skipped: number;
}

/** A rejected proposal is not raised again for this long. */
const REJECTION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Office state derived from open work: waiting on the CEO > working > idle. */
export async function refreshAgentStates(db: Database | Tx, ids?: string[]): Promise<void> {
  const [rows, pending, active] = await Promise.all([
    ids ? db.select().from(agents).where(inArray(agents.id, ids)) : db.select().from(agents),
    db
      .select({ agentId: approvals.requestedBy })
      .from(approvals)
      .where(eq(approvals.status, 'pending')),
    db.select({ agentId: tasks.agentId }).from(tasks).where(eq(tasks.status, 'in_progress')),
  ]);
  const awaiting = new Set(pending.map((r) => r.agentId));
  const working = new Set(active.map((r) => r.agentId));
  for (const agent of rows) {
    if (agent.state === 'offline' || agent.state === 'meeting') continue;
    const state: AgentState = awaiting.has(agent.id)
      ? 'awaiting_approval'
      : working.has(agent.id)
        ? 'working'
        : 'idle';
    if (state !== agent.state)
      await db.update(agents).set({ state }).where(eq(agents.id, agent.id));
  }
}

async function loadStore(tx: Tx) {
  const [productRows, listingRows] = await Promise.all([
    tx.select().from(products),
    tx
      .select({
        sku: products.sku,
        marketplace: listings.marketplace,
        externalId: listings.externalId,
        title: listings.title,
        priceCents: listings.priceCents,
        status: listings.status,
        qualityScore: listings.qualityScore,
        visits30d: listings.visits30d,
        sales30d: listings.sales30d,
      })
      .from(listings)
      .innerJoin(products, eq(listings.productId, products.id)),
  ]);
  return { products: productRows, listings: listingRows };
}

/** Keys that must not be raised again: open work, or proposals the CEO rejected recently. */
async function blockedKeys(tx: Tx, now: Date) {
  const [openApprovals, recentlyRejected, openTasks] = await Promise.all([
    tx
      .select({ key: approvals.key })
      .from(approvals)
      .where(and(eq(approvals.status, 'pending'), isNotNull(approvals.key))),
    tx
      .select({ key: approvals.key })
      .from(approvals)
      .where(
        and(
          eq(approvals.status, 'rejected'),
          isNotNull(approvals.key),
          gte(approvals.decidedAt, new Date(now.getTime() - REJECTION_COOLDOWN_MS)),
        ),
      ),
    tx
      .select({ key: tasks.key })
      .from(tasks)
      .where(and(inArray(tasks.status, ['todo', 'in_progress']), isNotNull(tasks.key))),
  ]);
  return {
    approvals: new Set([...openApprovals, ...recentlyRejected].map((r) => r.key)),
    tasks: new Set(openTasks.map((r) => r.key)),
  };
}

/**
 * One work cycle: every agent looks at the store, opens tasks and proposes actions.
 * Actions within an agent's autonomy run immediately; the rest wait for the CEO.
 */
export async function runCycle(db: Database, now: Date = new Date()): Promise<CycleSummary> {
  const summary: CycleSummary = {
    tasksCreated: 0,
    approvalsRequested: 0,
    actionsExecuted: 0,
    skipped: 0,
  };

  await db.transaction(async (tx) => {
    const [store, blocked, agentRows] = await Promise.all([
      loadStore(tx),
      blockedKeys(tx, now),
      tx.select().from(agents),
    ]);
    const byId = new Map<string, AgentRow>(agentRows.map((a) => [a.id, a]));
    const hasActiveTask = new Set(
      (
        await tx
          .select({ agentId: tasks.agentId })
          .from(tasks)
          .where(eq(tasks.status, 'in_progress'))
      ).map((r) => r.agentId),
    );

    for (const proposal of analyzeStore(store, now)) {
      const agent = byId.get(proposal.agentId);
      if (!agent || agent.state === 'offline') {
        summary.skipped++;
        continue;
      }
      if (proposal.kind === 'task') {
        if (blocked.tasks.has(proposal.key)) {
          summary.skipped++;
          continue;
        }
        await createTask(tx, proposal, hasActiveTask.has(agent.id) ? 'todo' : 'in_progress', now);
        hasActiveTask.add(agent.id);
        blocked.tasks.add(proposal.key);
        summary.tasksCreated++;
        continue;
      }

      if (blocked.approvals.has(proposal.key)) {
        summary.skipped++;
        continue;
      }
      blocked.approvals.add(proposal.key);
      const action = ACTIONS[proposal.action];
      const route = routeAction(action, agent);
      if (route.kind === 'execute') {
        await applyAction(
          tx,
          {
            action: proposal.action,
            payload: proposal.payload,
            summary: proposal.summary,
            requestedBy: agent.id,
          },
          agent.id,
          now,
        );
        summary.actionsExecuted++;
        continue;
      }
      const [approval] = await tx
        .insert(approvals)
        .values({
          requestedBy: agent.id,
          action: proposal.action,
          summary: proposal.summary,
          risk: action.risk,
          payload: proposal.payload,
          key: proposal.key,
          createdAt: now,
        })
        .returning({ id: approvals.id });
      if (!approval) throw new Error('approval not inserted');
      await tx.insert(auditLog).values({
        actor: agent.id,
        action: 'approval.requested',
        entity: 'approval',
        entityId: approval.id,
        after: { action: proposal.action, summary: proposal.summary },
        createdAt: now,
      });
      summary.approvalsRequested++;
    }

    await refreshAgentStates(tx);
  });

  return summary;
}

async function createTask(
  tx: Tx,
  proposal: Extract<Proposal, { kind: 'task' }>,
  status: 'todo' | 'in_progress',
  now: Date,
) {
  const [task] = await tx
    .insert(tasks)
    .values({
      agentId: proposal.agentId,
      title: proposal.title,
      details: proposal.details ?? null,
      key: proposal.key,
      status,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: tasks.id });
  if (!task) throw new Error('task not inserted');
  await tx.insert(auditLog).values({
    actor: proposal.agentId,
    action: 'task.created',
    entity: 'task',
    entityId: task.id,
    after: { title: proposal.title },
    createdAt: now,
  });
}
