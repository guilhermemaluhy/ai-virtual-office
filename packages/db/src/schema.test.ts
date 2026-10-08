import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { agents, approvals, listings, products } from './index.js';
import { createTestDatabase, type TestDatabase } from './testing.js';

describe('schema (PGlite)', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it('applies migrations and stores the org chart hierarchy', async () => {
    const { db } = testDb;
    await db.insert(agents).values([
      {
        id: 'ml-diretor',
        name: 'Rafael',
        title: 'Diretor ML',
        role: 'diretor',
        marketplace: 'mercado_livre',
      },
      {
        id: 'ml-ads',
        name: 'Bianca',
        title: 'Analista de Ads ML',
        role: 'ads',
        marketplace: 'mercado_livre',
        reportsTo: 'ml-diretor',
      },
    ]);

    const [ads] = await db.select().from(agents).where(eq(agents.id, 'ml-ads'));
    expect(ads).toMatchObject({ reportsTo: 'ml-diretor', state: 'idle', autonomy: 'read' });
  });

  it('enforces one listing per marketplace external id', async () => {
    const { db } = testDb;
    const [product] = await db
      .insert(products)
      .values({ sku: 'SKU-1', title: 'Produto', category: 'Casa', costCents: 1000, stock: 5 })
      .returning();
    if (!product) throw new Error('product not inserted');

    const listing = {
      productId: product.id,
      marketplace: 'shopee' as const,
      externalId: 'SHP-1',
      title: 'Produto',
      priceCents: 2000,
      status: 'active' as const,
      qualityScore: 80,
    };
    await db.insert(listings).values(listing);
    await expect(db.insert(listings).values(listing)).rejects.toThrow();
  });

  it('defaults approvals to pending', async () => {
    const { db } = testDb;
    const [approval] = await db
      .insert(approvals)
      .values({
        requestedBy: 'ml-ads',
        action: 'ads.set_budget',
        summary: 'Subir orçamento',
        risk: 'medium',
      })
      .returning();
    expect(approval).toMatchObject({ status: 'pending', payload: {}, decidedBy: null });
  });
});
