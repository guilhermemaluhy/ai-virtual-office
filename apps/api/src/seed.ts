import { ORG_CHART } from '@aivo/agents';
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

const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function insertInBatches<T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += BATCH) {
    await insert(rows.slice(i, i + BATCH));
  }
}

/**
 * Replaces all data with the simulated store and the 15-agent org chart.
 * Development/demo only — it wipes every table.
 */
export async function seedDatabase(db: Database, options: SeedOptions = {}): Promise<SeedSummary> {
  const store = generateSimulatedStore({
    seed: options.seed ?? 42,
    now: options.now ?? new Date(),
  });

  return db.transaction(async (tx) => {
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

    const outOfStock = store.products.filter((p) => p.stock === 0);
    // Active ML listing with the most visits and the worst conversion: candidate for a price cut.
    const priceCut = store.listings
      .filter((l) => l.marketplace === 'mercado_livre' && l.status === 'active' && l.visits30d > 0)
      .sort(
        (a, b) => a.sales30d / a.visits30d - b.sales30d / b.visits30d || b.visits30d - a.visits30d,
      )[0];
    if (!priceCut) throw new Error('Simulated store has no active Mercado Livre listing');
    const newPrice = Math.round((priceCut.priceCents * 0.92) / 100) * 100 - 10;
    const incomplete = store.listings.filter((l) => l.qualityScore < 60);

    const taskRows = await tx
      .insert(tasks)
      .values([
        {
          agentId: 'comprador',
          title: 'Revisar cobertura de estoque dos 100 SKUs',
          status: 'in_progress',
        },
        {
          agentId: 'ml-cadastro',
          title: `Completar ${String(incomplete.filter((l) => l.marketplace === 'mercado_livre').length)} anúncios com ficha incompleta`,
        },
        {
          agentId: 'shopee-cadastro',
          title: `Completar ${String(incomplete.filter((l) => l.marketplace === 'shopee').length)} anúncios com ficha incompleta`,
        },
        {
          agentId: 'ml-ads',
          title: 'Analisar ACOS das campanhas da semana',
          status: 'in_progress',
        },
        { agentId: 'shopee-campanhas', title: 'Montar calendário promocional do 11.11' },
        {
          agentId: 'ml-atendimento',
          title: 'Responder perguntas pré-venda pendentes',
          status: 'in_progress',
        },
        { agentId: 'shopee-atendimento', title: 'Revisar reclamações abertas da semana' },
        { agentId: 'ml-afiliados', title: 'Levantar produtos com maior comissão potencial' },
      ])
      .returning();

    const approvalRows = await tx
      .insert(approvals)
      .values([
        ...outOfStock.map((product) => ({
          requestedBy: 'comprador',
          action: 'purchase.create_order',
          summary: `Comprar 50 un. de "${product.title}" (${product.sku}) — sem estoque`,
          risk: 'high' as const,
          payload: { sku: product.sku, quantity: 50, unitCostCents: product.costCents },
        })),
        {
          requestedBy: 'ml-estrategista',
          action: 'listing.change_price',
          summary: `Reduzir preço de "${priceCut.title}" de ${brl(priceCut.priceCents)} para ${brl(newPrice)} para recuperar conversão`,
          risk: 'high' as const,
          payload: {
            listingExternalId: priceCut.externalId,
            fromCents: priceCut.priceCents,
            toCents: newPrice,
          },
        },
        {
          requestedBy: 'ml-ads',
          action: 'ads.set_daily_budget',
          summary: 'Aumentar orçamento diário de Mercado Ads de R$ 50 para R$ 80',
          risk: 'medium' as const,
          payload: { fromCents: 5000, toCents: 8000 },
        },
        {
          requestedBy: 'shopee-campanhas',
          action: 'campaign.join',
          summary: 'Aderir à campanha 11.11 da Shopee com 10% de desconto em 15 produtos',
          risk: 'high' as const,
          payload: { campaign: '11.11', discountPct: 10, products: 15 },
        },
      ])
      .returning();

    return {
      agents: ORG_CHART.length,
      products: productRows.length,
      listings: listingRows.length,
      orders: store.orders.length,
      tasks: taskRows.length,
      approvals: approvalRows.length,
    };
  });
}
