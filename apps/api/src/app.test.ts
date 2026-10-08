import { approvals, auditLog, products } from '@aivo/db';
import { createTestDatabase, type TestDatabase } from '@aivo/db/testing';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import type { OrgNode } from './routes/agents.js';
import { seedDatabase, type SeedSummary } from './seed.js';

const now = new Date('2026-10-08T12:00:00Z');

describe('api', () => {
  let testDb: TestDatabase;
  let app: FastifyInstance;
  let summary: SeedSummary;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    summary = await seedDatabase(testDb.db, { seed: 42, now });
    app = buildApp({ db: testDb.db, now: () => now });
  }, 30_000);

  afterAll(async () => {
    await app.close();
    await testDb.close();
  });

  it('GET /health returns ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('seeds the org chart and the simulated store', () => {
    expect(summary).toMatchObject({ agents: 13, products: 100 });
    expect(summary.listings).toBeGreaterThan(150);
    expect(summary.orders).toBeGreaterThan(0);
  });

  it('seeding twice replaces the data', async () => {
    await seedDatabase(testDb.db, { seed: 42, now });
    expect(await testDb.db.$count(products)).toBe(100);
  });

  it('GET /org-chart nests the company under the CEO', async () => {
    const response = await app.inject({ method: 'GET', url: '/org-chart' });
    const { ceo } = response.json<{ ceo: { reports: OrgNode[] } }>();
    expect(ceo.reports.map((a) => a.id).sort()).toEqual([
      'comprador',
      'ml-diretor',
      'shopee-diretor',
    ]);
    const ml = ceo.reports.find((a) => a.id === 'ml-diretor');
    expect(ml?.reports.map((a) => a.id)).toEqual(['ml-estrategista']);
    expect(ml?.reports[0]?.reports).toHaveLength(4);
  });

  it('GET /agents/:id returns the agent with its tasks', async () => {
    const response = await app.inject({ method: 'GET', url: '/agents/comprador' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: 'comprador', name: 'Paulo', tasks: [{}] });
    expect((await app.inject({ method: 'GET', url: '/agents/nope' })).statusCode).toBe(404);
  });

  it('GET /listings filters by marketplace and validates input', async () => {
    const response = await app.inject({ method: 'GET', url: '/listings?marketplace=shopee' });
    const rows = response.json<{ marketplace: string }[]>();
    expect(rows.length).toBeGreaterThan(70);
    expect(rows.every((row) => row.marketplace === 'shopee')).toBe(true);

    const invalid = await app.inject({ method: 'GET', url: '/listings?marketplace=amazon' });
    expect(invalid.statusCode).toBe(400);
  });

  it('GET /products?maxStock filters low stock', async () => {
    const response = await app.inject({ method: 'GET', url: '/products?maxStock=0' });
    const rows = response.json<{ stock: number }[]>();
    expect(rows.every((row) => row.stock === 0)).toBe(true);
  });

  it('GET /dashboard/summary aggregates both marketplaces', async () => {
    const response = await app.inject({ method: 'GET', url: '/dashboard/summary' });
    const body = response.json<{
      marketplaces: { marketplace: string; orders30d: number; revenue30dCents: number }[];
      pendingApprovals: number;
    }>();
    expect(body.marketplaces.map((m) => m.marketplace)).toEqual(['mercado_livre', 'shopee']);
    for (const m of body.marketplaces) {
      expect(m.orders30d).toBeGreaterThan(0);
      expect(m.revenue30dCents).toBeGreaterThan(0);
    }
    expect(body.pendingApprovals).toBe(summary.approvals);
  });

  it('POST /approvals/:id/decision records the CEO decision once', async () => {
    const [pending] = await testDb.db
      .select()
      .from(approvals)
      .where(eq(approvals.status, 'pending'))
      .limit(1);
    if (!pending) throw new Error('no pending approval seeded');
    const url = `/approvals/${pending.id}/decision`;

    const ok = await app.inject({
      method: 'POST',
      url,
      payload: { decision: 'approved', note: 'Pode seguir' },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({
      status: 'approved',
      decidedBy: 'ceo',
      decisionNote: 'Pode seguir',
    });

    const again = await app.inject({ method: 'POST', url, payload: { decision: 'rejected' } });
    expect(again.statusCode).toBe(409);

    const audit = await testDb.db.select().from(auditLog).where(eq(auditLog.entityId, pending.id));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor: 'ceo', action: 'approval.approved' });
  });

  it('POST /approvals/:id/decision validates input', async () => {
    const badId = await app.inject({
      method: 'POST',
      url: '/approvals/not-a-uuid/decision',
      payload: { decision: 'approved' },
    });
    expect(badId.statusCode).toBe(400);

    const missing = await app.inject({
      method: 'POST',
      url: '/approvals/00000000-0000-4000-8000-000000000000/decision',
      payload: { decision: 'approved' },
    });
    expect(missing.statusCode).toBe(404);

    const badBody = await app.inject({
      method: 'POST',
      url: '/approvals/00000000-0000-4000-8000-000000000000/decision',
      payload: { decision: 'maybe' },
    });
    expect(badBody.statusCode).toBe(400);
  });

  it('GET /tasks filters by agent', async () => {
    const response = await app.inject({ method: 'GET', url: '/tasks?agentId=ml-ads' });
    const rows = response.json<{ agentId: string }[]>();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.agentId === 'ml-ads')).toBe(true);
  });
});
