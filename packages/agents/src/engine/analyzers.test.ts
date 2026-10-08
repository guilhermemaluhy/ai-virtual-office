import { describe, expect, it } from 'vitest';
import {
  analyzeAds,
  analyzeCampaigns,
  analyzeListings,
  analyzePricing,
  analyzeStock,
  analyzeStore,
} from './analyzers.js';
import { upcomingEvents } from './calendar.js';
import type { ListingData, StoreData } from './types.js';

const listing = (overrides: Partial<ListingData>): ListingData => ({
  sku: 'SKU-1',
  marketplace: 'mercado_livre',
  externalId: 'MLB1',
  title: 'Produto',
  priceCents: 10000,
  status: 'active',
  qualityScore: 90,
  visits30d: 1000,
  sales30d: 30,
  ...overrides,
});

const now = new Date('2026-10-08T12:00:00Z');

describe('analyzeStock', () => {
  it('orders stock-outs and short coverage, sized for 30 days', () => {
    const data: StoreData = {
      products: [
        { sku: 'A', title: 'Sem estoque', costCents: 1000, stock: 0 },
        { sku: 'B', title: 'Pouco', costCents: 1000, stock: 4 },
        { sku: 'C', title: 'Folgado', costCents: 1000, stock: 500 },
      ],
      listings: [
        listing({ sku: 'A', sales30d: 0 }),
        listing({ sku: 'B', externalId: 'MLB2', sales30d: 60 }),
        listing({ sku: 'C', externalId: 'MLB3', sales30d: 60 }),
      ],
    };
    const proposals = analyzeStock(data);
    expect(proposals.map((p) => p.key)).toEqual(['purchase:A', 'purchase:B']);
    const b = proposals[1];
    expect(b?.kind === 'action' && b.payload.quantity).toBe(60);
    expect(b?.kind === 'action' && b.summary).toContain('cobre só 2 dias');
  });
});

describe('analyzePricing', () => {
  const products = [{ sku: 'SKU-1', title: 'Produto', costCents: 8000, stock: 10 }];

  it('asks to raise thin margins', () => {
    const [p] = analyzePricing(
      { products, listings: [listing({ priceCents: 9990 })] },
      'mercado_livre',
    );
    expect(p).toMatchObject({
      kind: 'action',
      action: 'listing.change_price',
      agentId: 'ml-estrategista',
    });
    expect(p?.kind === 'action' && p.payload.toCents).toBe(12790);
  });

  it('cuts price on low conversion but never below the floor', () => {
    const cheap = [{ ...products[0], costCents: 3000 } as (typeof products)[number]];
    const lowConv = listing({ priceCents: 10000, visits30d: 2000, sales30d: 5 });
    const [cut] = analyzePricing({ products: cheap, listings: [lowConv] }, 'mercado_livre');
    expect(cut?.kind === 'action' && cut.payload.toCents).toBe(9190);

    const nearFloor = [{ ...products[0], costCents: 7000 } as (typeof products)[number]];
    expect(analyzePricing({ products: nearFloor, listings: [lowConv] }, 'mercado_livre')).toEqual(
      [],
    );
  });
});

describe('analyzeListings', () => {
  it('turns incomplete listings into tasks for the right marketplace', () => {
    const tasks = analyzeListings(
      {
        products: [],
        listings: [
          listing({ qualityScore: 40 }),
          listing({ marketplace: 'shopee', qualityScore: 10 }),
        ],
      },
      'mercado_livre',
    );
    expect(tasks).toEqual([expect.objectContaining({ kind: 'task', agentId: 'ml-cadastro' })]);
  });
});

describe('analyzeAds', () => {
  it('needs at least three champions', () => {
    const champions = [1, 2, 3].map((i) =>
      listing({ externalId: `MLB${String(i)}`, visits30d: 100, sales30d: 10 }),
    );
    expect(analyzeAds({ products: [], listings: champions.slice(0, 2) }, 'mercado_livre')).toEqual(
      [],
    );
    expect(
      analyzeAds({ products: [], listings: champions }, 'mercado_livre').map((p) => p.kind),
    ).toEqual(['task', 'action']);
  });
});

describe('campaigns', () => {
  it('finds the next marketplace date inside the horizon', () => {
    expect(upcomingEvents('shopee', now, 45).map((e) => e.event.id)).toEqual(['10-10', '11-11']);
    expect(upcomingEvents('mercado_livre', now, 45).map((e) => e.event.id)).toEqual(['11-11']);
  });

  it('only proposes products that keep margin after the discount', () => {
    const data: StoreData = {
      products: [
        { sku: 'OK', title: 'Margem boa', costCents: 3000, stock: 50 },
        { sku: 'NO', title: 'Margem ruim', costCents: 8000, stock: 50 },
      ],
      listings: [
        listing({ sku: 'OK', marketplace: 'shopee', externalId: 'S1' }),
        listing({ sku: 'NO', marketplace: 'shopee', externalId: 'S2' }),
      ],
    };
    const proposals = analyzeCampaigns(data, 'shopee', now);
    const action = proposals.find((p) => p.kind === 'action');
    expect(action?.kind === 'action' && action.payload.listings).toEqual(['S1']);
    expect(action?.key).toBe('campaign:shopee:10-10');
  });
});

describe('analyzeStore', () => {
  it('only uses known actions and unique keys', () => {
    const data: StoreData = {
      products: [{ sku: 'SKU-1', title: 'Produto', costCents: 3000, stock: 0 }],
      listings: [listing({ qualityScore: 30 })],
    };
    const proposals = analyzeStore(data, now);
    const keys = proposals.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
