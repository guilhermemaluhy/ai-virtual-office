import { ORG_CHART, runCycle } from '@aivo/agents';
import {
  agents,
  approvals,
  auditLog,
  type Database,
  listings,
  orders,
  products,
  reports,
  tasks,
} from '@aivo/db';
import { generateSimulatedStore } from '@aivo/marketplace';

export interface SeedOptions {
  seed?: number;
  now?: Date;
}

export interface SeedSummary {
  agents: number;
  products: number;
  listings: number;
  orders: number;
  tasks: number;
  approvals: number;
}

const BATCH = 500;

async function insertInBatches<T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += BATCH) {
    await insert(rows.slice(i, i + BATCH));
  }
}

/**
 * Replaces all data with the simulated store and the 15-agent org chart, then runs the
 * first agent cycle. Development/demo only — it wipes every table.
 */
export async function seedDatabase(db: Database, options: SeedOptions = {}): Promise<SeedSummary> {
  const now = options.now ?? new Date();
  const store = generateSimulatedStore({ seed: options.seed ?? 42, now });

  const base = await db.transaction(async (tx) => {
    for (const table of [auditLog, reports, approvals, tasks, orders, listings, products]) {
      await tx.delete(table);
    }
    // Delete subordinates before managers (self-referencing FK).
    await tx.update(agents).set({ reportsTo: null });
    await tx.delete(agents);

    await tx.insert(agents).values(
      ORG_CHART.map(({ id, name, title, role, marketplace, reportsTo }) => ({
        id,
        name,
        title,
        role,
        marketplace,
        reportsTo,
      })),
    );

    const productRows = await tx.insert(products).values(store.products).returning();
    const productIdBySku = new Map(productRows.map((p) => [p.sku, p.id]));

    const listingRows = await tx
      .insert(listings)
      .values(
        store.listings.map(({ sku, ...listing }) => {
          const productId = productIdBySku.get(sku);
          if (!productId) throw new Error(`Unknown SKU ${sku}`);
          return { ...listing, productId };
        }),
      )
      .returning();
    const listingIdByExternalId = new Map(listingRows.map((l) => [l.externalId, l.id]));

    await insertInBatches(
      store.orders.map(({ listingExternalId, ...order }) => {
        const listingId = listingIdByExternalId.get(listingExternalId);
        if (!listingId) throw new Error(`Unknown listing ${listingExternalId}`);
        return { ...order, listingId };
      }),
      (batch) => tx.insert(orders).values(batch),
    );

    return {
      agents: ORG_CHART.length,
      products: productRows.length,
      listings: listingRows.length,
      orders: store.orders.length,
    };
  });

  // First work cycle: the agents look at the fresh store and open tasks/approvals.
  const cycle = await runCycle(db, now);
  return { ...base, tasks: cycle.tasksCreated, approvals: cycle.approvalsRequested };
}
