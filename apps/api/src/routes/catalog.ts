import { type Database, listings, products } from '@aivo/db';
import { LISTING_STATUSES, MARKETPLACES } from '@aivo/shared';
import { and, asc, eq, lte, type SQL } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../validation.js';

const productQuery = z.object({
  maxStock: z.coerce.number().int().nonnegative().optional(),
});

const listingQuery = z.object({
  marketplace: z.enum(MARKETPLACES).optional(),
  status: z.enum(LISTING_STATUSES).optional(),
});

export function catalogRoutes(app: FastifyInstance, db: Database) {
  app.get('/products', async (request, reply) => {
    const query = parseOrReply(productQuery, request.query, reply);
    if (!query) return;
    return db
      .select()
      .from(products)
      .where(query.maxStock === undefined ? undefined : lte(products.stock, query.maxStock))
      .orderBy(asc(products.sku));
  });

  app.get('/listings', async (request, reply) => {
    const query = parseOrReply(listingQuery, request.query, reply);
    if (!query) return;
    const filters: SQL[] = [];
    if (query.marketplace) filters.push(eq(listings.marketplace, query.marketplace));
    if (query.status) filters.push(eq(listings.status, query.status));
    return db
      .select()
      .from(listings)
      .where(and(...filters))
      .orderBy(asc(listings.marketplace), asc(listings.externalId));
  });
}
