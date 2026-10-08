import { approvals, type Database, listings, orders, products } from '@aivo/db';
import { type Marketplace, MARKETPLACES } from '@aivo/shared';
import { count, eq, gte, sql, sum } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MarketplaceSummary {
  marketplace: Marketplace;
  activeListings: number;
  orders30d: number;
  revenue30dCents: number;
}

export function dashboardRoutes(app: FastifyInstance, db: Database, now: () => Date) {
  app.get('/dashboard/summary', async () => {
    const since = new Date(now().getTime() - 30 * DAY_MS);

    const [activeRows, orderRows, [stock], [pending]] = await Promise.all([
      db
        .select({ marketplace: listings.marketplace, value: count() })
        .from(listings)
        .where(eq(listings.status, 'active'))
        .groupBy(listings.marketplace),
      db
        .select({
          marketplace: orders.marketplace,
          orders: count(),
          revenue: sum(orders.totalCents).mapWith(Number),
        })
        .from(orders)
        .where(gte(orders.orderedAt, since))
        .groupBy(orders.marketplace),
      db
        .select({
          outOfStock: sql<number>`count(*) filter (where ${products.stock} = 0)`.mapWith(Number),
          lowStock: sql<number>`count(*) filter (where ${products.stock} between 1 and 5)`.mapWith(
            Number,
          ),
        })
        .from(products),
      db.select({ value: count() }).from(approvals).where(eq(approvals.status, 'pending')),
    ]);

    const marketplaces: MarketplaceSummary[] = MARKETPLACES.map((marketplace) => {
      const orderRow = orderRows.find((row) => row.marketplace === marketplace);
      return {
        marketplace,
        activeListings: activeRows.find((row) => row.marketplace === marketplace)?.value ?? 0,
        orders30d: orderRow?.orders ?? 0,
        revenue30dCents: orderRow?.revenue ?? 0,
      };
    });

    return {
      marketplaces,
      stock: { outOfStock: stock?.outOfStock ?? 0, lowStock: stock?.lowStock ?? 0 },
      pendingApprovals: pending?.value ?? 0,
    };
  });
}
