import { agents, approvals, auditLog, listings, products, tasks } from '@aivo/db';
import { createTestDatabase, type TestDatabase } from '@aivo/db/testing';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ORG_CHART } from '../org-chart.js';
import { refreshAgentStates, runCycle } from './cycle.js';
import { applyAction } from './executor.js';

const now = new Date('2026-10-08T12:00:00Z');

describe('runCycle (PGlite)', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    const { db } = testDb;
    await db.insert(agents).values(
      ORG_CHART.map(({ id, name, title, role, marketplace, reportsTo }) => ({
        id,
        name,
        title,
        role,
        marketplace,
        reportsTo,
      })),
    );
    const [out, thin] = await db
      .insert(products)
      .values([
        { sku: 'OUT', title: 'Sem estoque', category: 'Casa', costCents: 2000, stock: 0 },
        { sku: 'THIN', title: 'Margem baixa', category: 'Casa', costCents: 8000, stock: 80 },
      ])
      .returning();
    if (!out || !thin) throw new Error('seed failed');
    await db.insert(listings).values([
      {
        productId: out.id,
        marketplace: 'mercado_livre',
        externalId: 'MLB-OUT',
        title: 'Sem estoque',
        priceCents: 4990,
        status: 'paused',
        qualityScore: 40,
        visits30d: 300,
        sales30d: 15,
      },
      {
        productId: thin.id,
        marketplace: 'mercado_livre',
        externalId: 'MLB-THIN',
        title: 'Margem baixa',
        priceCents: 9990,
        status: 'active',
        qualityScore: 90,
        visits30d: 500,
        sales30d: 20,
      },
    ]);
  }, 30_000);

  afterEach(async () => {
    await testDb.close();
  });

  it('creates tasks and approvals once, with audit trail and office states', async () => {
    const { db } = testDb;
    const first = await runCycle(db, now);
    expect(first.approvalsRequested).toBeGreaterThanOrEqual(2);
    expect(first.tasksCreated).toBeGreaterThan(0);

    const pending = await db.select().from(approvals);
    expect(pending.map((a) => a.action).sort()).toEqual(
      expect.arrayContaining(['listing.change_price', 'purchase.create_order']),
    );
    const price = pending.find((a) => a.action === 'listing.change_price');
    expect(price).toMatchObject({
      requestedBy: 'ml-estrategista',
      risk: 'high',
      key: 'price:MLB-THIN',
    });

    const second = await runCycle(db, now);
    expect(second.approvalsRequested).toBe(0);
    expect(second.tasksCreated).toBe(0);

    const states = Object.fromEntries((await db.select().from(agents)).map((a) => [a.id, a.state]));
    expect(states.comprador).toBe('awaiting_approval');
    expect(states['ml-cadastro']).toBe('working');
    expect(states['ml-diretor']).toBe('idle');

    expect((await db.select().from(auditLog)).length).toBe(
      first.approvalsRequested + first.tasksCreated,
    );
  });

  it('does not re-propose what the CEO rejected recently', async () => {
    const { db } = testDb;
    await runCycle(db, now);
    await db.update(approvals).set({ status: 'rejected', decidedBy: 'ceo', decidedAt: now });
    const again = await runCycle(db, new Date(now.getTime() + 60_000));
    expect(again.approvalsRequested).toBe(0);
  });

  it('applies approved purchases and prices to the store', async () => {
    const { db } = testDb;
    await db.transaction(async (tx) => {
      await applyAction(
        tx,
        {
          action: 'purchase.create_order',
          payload: { sku: 'OUT', quantity: 30 },
          summary: 'Comprar',
          requestedBy: 'comprador',
        },
        'ceo',
        now,
      );
      await applyAction(
        tx,
        {
          action: 'listing.change_price',
          payload: { listingExternalId: 'MLB-THIN', toCents: 12790 },
          summary: 'Preço',
          requestedBy: 'ml-estrategista',
        },
        'ceo',
        now,
      );
    });
    const [out] = await db.select().from(products).where(eq(products.sku, 'OUT'));
    expect(out?.stock).toBe(30);
    const [reactivated] = await db
      .select()
      .from(listings)
      .where(eq(listings.externalId, 'MLB-OUT'));
    expect(reactivated?.status).toBe('active');
    const [repriced] = await db.select().from(listings).where(eq(listings.externalId, 'MLB-THIN'));
    expect(repriced?.priceCents).toBe(12790);
    const done = await db.select().from(tasks).where(eq(tasks.status, 'done'));
    expect(done).toHaveLength(2);
  });

  it('rejects unknown actions', async () => {
    await expect(
      testDb.db.transaction((tx) =>
        applyAction(
          tx,
          { action: 'nope', payload: {}, summary: '', requestedBy: 'comprador' },
          'ceo',
          now,
        ),
      ),
    ).rejects.toThrow(/desconhecida/);
  });

  it('refreshAgentStates keeps meeting and offline agents as they are', async () => {
    const { db } = testDb;
    await db.update(agents).set({ state: 'offline' }).where(eq(agents.id, 'comprador'));
    await runCycle(db, now);
    await refreshAgentStates(db);
    const [buyer] = await db.select().from(agents).where(eq(agents.id, 'comprador'));
    expect(buyer?.state).toBe('offline');
  });
});
