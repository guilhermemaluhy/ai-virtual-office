import { MARKETPLACE_LABELS, type Marketplace } from '@aivo/shared';
import { agentId } from '../org-chart.js';
import { upcomingEvents } from './calendar.js';
import { brl, marginPct, priceEnding90 } from './money.js';
import type { ListingData, Proposal, StoreData } from './types.js';

/** Thresholds the analysts work with. Tuned for a ~100-SKU operation. */
export const RULES = {
  /** Buy when stock covers fewer days than this. */
  minCoverageDays: 7,
  /** Purchase orders cover this many days of sales. */
  targetCoverageDays: 30,
  minPurchaseQty: 20,
  /** Minimum price over cost before the strategist asks for a raise. */
  minMarkup: 1.35,
  targetMarkup: 1.6,
  /** Low conversion: many visits, few sales. */
  lowConversion: 0.012,
  minVisitsForConversion: 400,
  priceCutPct: 0.08,
  /** Never cut below this markup. */
  floorMarkup: 1.4,
  incompleteQuality: 60,
  campaignHorizonDays: 45,
  campaignDiscountPct: 10,
  campaignMinMargin: 0.45,
  campaignMinStock: 20,
  /** Limit per cycle so the CEO is not flooded. */
  maxPerKind: 3,
} as const;

const dailySalesBySku = (data: StoreData) => {
  const sales = new Map<string, number>();
  for (const listing of data.listings) {
    sales.set(listing.sku, (sales.get(listing.sku) ?? 0) + listing.sales30d / 30);
  }
  return sales;
};

const costBySku = (data: StoreData) => new Map(data.products.map((p) => [p.sku, p.costCents]));
const stockBySku = (data: StoreData) => new Map(data.products.map((p) => [p.sku, p.stock]));
const listingsOf = (data: StoreData, marketplace: Marketplace) =>
  data.listings.filter((l) => l.marketplace === marketplace);
const conversion = (l: ListingData) => (l.visits30d > 0 ? l.sales30d / l.visits30d : 0);

/** Comprador: stock-outs and short coverage become purchase orders. */
export function analyzeStock(data: StoreData): Proposal[] {
  const daily = dailySalesBySku(data);
  return data.products
    .map((product) => {
      const perDay = daily.get(product.sku) ?? 0;
      // Days of sales the stock covers; zero stock covers nothing even without recent sales.
      const coverage = product.stock === 0 ? 0 : perDay > 0 ? product.stock / perDay : Infinity;
      return { product, perDay, coverage };
    })
    .filter(({ product, coverage }) => product.stock === 0 || coverage < RULES.minCoverageDays)
    .sort((a, b) => a.coverage - b.coverage || b.perDay - a.perDay)
    .slice(0, RULES.maxPerKind)
    .map(({ product, perDay, coverage }) => {
      const quantity = Math.max(RULES.minPurchaseQty, Math.ceil(perDay * RULES.targetCoverageDays));
      const reason =
        product.stock === 0
          ? 'sem estoque'
          : coverage < 1
            ? `só ${String(product.stock)} un. em estoque, menos de 1 dia de vendas`
            : `estoque cobre só ${String(Math.floor(coverage))} dias`;
      return {
        kind: 'action',
        agentId: 'comprador',
        key: `purchase:${product.sku}`,
        action: 'purchase.create_order',
        summary: `Comprar ${String(quantity)} un. de "${product.title}" (${product.sku}) — ${reason}`,
        payload: {
          sku: product.sku,
          quantity,
          unitCostCents: product.costCents,
          totalCostCents: quantity * product.costCents,
        },
      } satisfies Proposal;
    });
}

/** Especialista Estratégico: thin margins and low conversion become price proposals (CEO approves). */
export function analyzePricing(data: StoreData, marketplace: Marketplace): Proposal[] {
  const costs = costBySku(data);
  const agent = agentId(marketplace, 'estrategista');
  const active = listingsOf(data, marketplace).filter((l) => l.status === 'active');

  const raises = active
    .filter((l) => l.priceCents < (costs.get(l.sku) ?? 0) * RULES.minMarkup)
    .slice(0, RULES.maxPerKind)
    .map((l) => {
      const cost = costs.get(l.sku) ?? 0;
      const to = priceEnding90(cost * RULES.targetMarkup);
      return {
        kind: 'action',
        agentId: agent,
        key: `price:${l.externalId}`,
        action: 'listing.change_price',
        summary: `Subir preço de "${l.title}" de ${brl(l.priceCents)} para ${brl(to)} — margem bruta de só ${String(Math.round(marginPct(l.priceCents, cost) * 100))}%`,
        payload: {
          listingExternalId: l.externalId,
          fromCents: l.priceCents,
          toCents: to,
          reason: 'margin',
        },
      } satisfies Proposal;
    });

  const cuts = active
    .filter(
      (l) => l.visits30d >= RULES.minVisitsForConversion && conversion(l) < RULES.lowConversion,
    )
    .map((l) => ({
      l,
      cost: costs.get(l.sku) ?? 0,
      to: priceEnding90(l.priceCents * (1 - RULES.priceCutPct)),
    }))
    .filter(({ cost, to }) => to >= cost * RULES.floorMarkup)
    .sort((a, b) => b.l.visits30d - a.l.visits30d)
    .slice(0, RULES.maxPerKind)
    .map(({ l, to }) => ({
      kind: 'action' as const,
      agentId: agent,
      key: `price:${l.externalId}`,
      action: 'listing.change_price' as const,
      summary: `Reduzir preço de "${l.title}" de ${brl(l.priceCents)} para ${brl(to)} — ${String(l.visits30d)} visitas e conversão de ${(conversion(l) * 100).toFixed(2).replace('.', ',')}%`,
      payload: {
        listingExternalId: l.externalId,
        fromCents: l.priceCents,
        toCents: to,
        reason: 'conversion',
      },
    }));

  return [...raises, ...cuts];
}

/** Analista de Cadastro: incomplete listings become work items. */
export function analyzeListings(data: StoreData, marketplace: Marketplace): Proposal[] {
  return listingsOf(data, marketplace)
    .filter((l) => l.qualityScore < RULES.incompleteQuality)
    .sort((a, b) => a.qualityScore - b.qualityScore)
    .slice(0, RULES.maxPerKind)
    .map((l) => ({
      kind: 'task',
      agentId: agentId(marketplace, 'cadastro'),
      key: `content:${l.externalId}`,
      title: `Completar anúncio "${l.title}" (qualidade ${String(l.qualityScore)}/100)`,
      details: 'Revisar título, fotos, ficha técnica e variações.',
    }));
}

/** Analista de Ads: best sellers with good conversion deserve more budget. */
export function analyzeAds(data: StoreData, marketplace: Marketplace): Proposal[] {
  const champions = listingsOf(data, marketplace)
    .filter((l) => l.status === 'active' && conversion(l) >= 0.04)
    .sort((a, b) => b.sales30d - a.sales30d)
    .slice(0, 5);
  if (champions.length < 3) return [];
  const label = MARKETPLACE_LABELS[marketplace];
  return [
    {
      kind: 'task',
      agentId: agentId(marketplace, 'ads'),
      key: `ads-review:${marketplace}`,
      title: `Analisar ACOS das campanhas de ${label}`,
    },
    {
      kind: 'action',
      agentId: agentId(marketplace, 'ads'),
      key: `ads-budget:${marketplace}`,
      action: 'ads.set_daily_budget',
      summary: `Aumentar orçamento diário de Ads (${label}) de R$ 50 para R$ 80 para impulsionar ${String(champions.length)} campeões de venda (conversão ≥ 4%)`,
      payload: { fromCents: 5000, toCents: 8000, listings: champions.map((l) => l.externalId) },
    },
  ];
}

/** Analista de Afiliados: high-margin products with stock go to the affiliate program. */
export function analyzeAffiliates(data: StoreData, marketplace: Marketplace): Proposal[] {
  const costs = costBySku(data);
  const stock = stockBySku(data);
  const picks = listingsOf(data, marketplace)
    .filter((l) => l.status === 'active' && (stock.get(l.sku) ?? 0) >= 30)
    .map((l) => ({ l, margin: marginPct(l.priceCents, costs.get(l.sku) ?? 0) }))
    .filter(({ margin }) => margin >= 0.5)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);
  if (picks.length === 0) return [];
  return [
    {
      kind: 'action',
      agentId: agentId(marketplace, 'afiliados'),
      key: `affiliates:${marketplace}`,
      action: 'affiliates.add_products',
      summary: `Incluir ${String(picks.length)} produtos de margem alta no programa de afiliados (${MARKETPLACE_LABELS[marketplace]}) com comissão de 8%`,
      payload: { commissionPct: 8, listings: picks.map(({ l }) => l.externalId) },
    },
  ];
}

/** Analista de Campanhas: upcoming marketplace dates become join proposals. */
export function analyzeCampaigns(data: StoreData, marketplace: Marketplace, now: Date): Proposal[] {
  const [next] = upcomingEvents(marketplace, now, RULES.campaignHorizonDays);
  if (!next) return [];
  const costs = costBySku(data);
  const stock = stockBySku(data);
  const eligible = listingsOf(data, marketplace).filter((l) => {
    if (l.status !== 'active' || (stock.get(l.sku) ?? 0) < RULES.campaignMinStock) return false;
    const discounted = l.priceCents * (1 - RULES.campaignDiscountPct / 100);
    return marginPct(discounted, costs.get(l.sku) ?? 0) >= RULES.campaignMinMargin;
  });
  if (eligible.length === 0) return [];
  const agent = agentId(marketplace, 'campanhas');
  return [
    {
      kind: 'task',
      agentId: agent,
      key: `campaign-plan:${marketplace}:${next.event.id}`,
      title: `Montar plano para a campanha ${next.event.name} (em ${String(next.inDays)} dias)`,
    },
    {
      kind: 'action',
      agentId: agent,
      key: `campaign:${marketplace}:${next.event.id}`,
      action: 'campaign.join',
      summary: `Aderir à campanha ${next.event.name} (${MARKETPLACE_LABELS[marketplace]}) com ${String(RULES.campaignDiscountPct)}% de desconto em ${String(eligible.length)} produtos que mantêm margem ≥ ${String(RULES.campaignMinMargin * 100)}%`,
      payload: {
        campaign: next.event.id,
        date: next.date.toISOString().slice(0, 10),
        discountPct: RULES.campaignDiscountPct,
        listings: eligible.map((l) => l.externalId),
      },
    },
  ];
}

/** Analista de Atendimento: daily routine until real questions arrive with the integrations. */
export function analyzeSupport(marketplace: Marketplace, now: Date): Proposal[] {
  const day = now.toISOString().slice(0, 10);
  return [
    {
      kind: 'task',
      agentId: agentId(marketplace, 'atendimento'),
      key: `support:${marketplace}:${day}`,
      title: 'Responder perguntas pré-venda pendentes',
    },
  ];
}

/** All proposals for one cycle. Directors coordinate (dailies) and propose nothing here. */
export function analyzeStore(data: StoreData, now: Date): Proposal[] {
  const perMarketplace = (['mercado_livre', 'shopee'] as const).flatMap((marketplace) => [
    ...analyzePricing(data, marketplace),
    ...analyzeListings(data, marketplace),
    ...analyzeAds(data, marketplace),
    ...analyzeAffiliates(data, marketplace),
    ...analyzeCampaigns(data, marketplace, now),
    ...analyzeSupport(marketplace, now),
  ]);
  return [...analyzeStock(data), ...perMarketplace];
}
