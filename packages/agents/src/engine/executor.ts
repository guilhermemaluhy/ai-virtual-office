import { auditLog, type Database, listings, products, tasks } from '@aivo/db';
import { isActionId } from '@aivo/tools';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface ExecutableAction {
  action: string;
  payload: Record<string, unknown>;
  summary: string;
  requestedBy: string;
}

const priceChange = z.object({
  listingExternalId: z.string(),
  toCents: z.number().int().positive(),
});
const purchase = z.object({ sku: z.string(), quantity: z.number().int().positive() });

/**
 * Applies an approved (or autonomous) action. Price and stock changes update the local
 * store — the marketplace integrations (fases 6–7) will push them to ML/Shopee. Actions
 * with no local model yet become a completed task for the requesting agent.
 */
export async function applyAction(
  tx: Tx,
  item: ExecutableAction,
  actor: string,
  now: Date,
): Promise<void> {
  if (!isActionId(item.action)) throw new Error(`Ação desconhecida: ${item.action}`);

  switch (item.action) {
    case 'listing.change_price': {
      const { listingExternalId, toCents } = priceChange.parse(item.payload);
      const [before] = await tx
        .select()
        .from(listings)
        .where(eq(listings.externalId, listingExternalId));
      if (!before) throw new Error(`Anúncio ${listingExternalId} não encontrado`);
      await tx.update(listings).set({ priceCents: toCents }).where(eq(listings.id, before.id));
      await audit(
        tx,
        actor,
        'listing.price_changed',
        'listing',
        before.id,
        { priceCents: before.priceCents },
        { priceCents: toCents },
        now,
      );
      break;
    }
    case 'purchase.create_order': {
      const { sku, quantity } = purchase.parse(item.payload);
      const [before] = await tx.select().from(products).where(eq(products.sku, sku));
      if (!before) throw new Error(`Produto ${sku} não encontrado`);
      // Simulation: the order arrives right away and stock-paused listings come back.
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} + ${quantity}` })
        .where(eq(products.id, before.id));
      if (before.stock === 0) {
        await tx
          .update(listings)
          .set({ status: 'active' })
          .where(and(eq(listings.productId, before.id), eq(listings.status, 'paused')));
      }
      await audit(
        tx,
        actor,
        'purchase.received',
        'product',
        before.id,
        { stock: before.stock },
        { stock: before.stock + quantity },
        now,
      );
      break;
    }
    default:
      break;
  }

  await tx.insert(tasks).values({
    agentId: item.requestedBy,
    title: `Executado: ${item.summary}`,
    status: 'done',
    createdAt: now,
    updatedAt: now,
  });
}

async function audit(
  tx: Tx,
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  before: unknown,
  after: unknown,
  now: Date,
) {
  await tx
    .insert(auditLog)
    .values({ actor, action, entity, entityId, before, after, createdAt: now });
}
