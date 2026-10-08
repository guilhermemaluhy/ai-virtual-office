import { describe, expect, it } from 'vitest';
import { generateSimulatedStore, SimulatedMarketplaceAdapter } from './index.js';

const now = new Date('2026-10-08T12:00:00Z');
const store = generateSimulatedStore({ seed: 7, now });

describe('generateSimulatedStore', () => {
  it('creates 100 products with unique SKUs', () => {
    expect(store.products).toHaveLength(100);
    expect(new Set(store.products.map((p) => p.sku)).size).toBe(100);
  });

  it('lists products on both marketplaces', () => {
    const ml = store.listings.filter((l) => l.marketplace === 'mercado_livre');
    const shopee = store.listings.filter((l) => l.marketplace === 'shopee');
    expect(ml.length).toBeGreaterThan(70);
    expect(shopee.length).toBeGreaterThan(70);
    expect(new Set(store.listings.map((l) => l.externalId)).size).toBe(store.listings.length);
  });

  it('is deterministic for the same seed', () => {
    expect(generateSimulatedStore({ seed: 7, now })).toEqual(store);
    expect(generateSimulatedStore({ seed: 8, now })).not.toEqual(store);
  });

  it('keeps listings, orders and stock consistent', () => {
    const skus = new Set(store.products.map((p) => p.sku));
    for (const listing of store.listings) {
      expect(skus.has(listing.sku)).toBe(true);
      expect(listing.priceCents).toBeGreaterThan(0);
      expect(listing.qualityScore).toBeGreaterThanOrEqual(0);
      expect(listing.qualityScore).toBeLessThanOrEqual(100);
      expect(listing.visits30d).toBeGreaterThanOrEqual(listing.sales30d);
      const sold = store.orders
        .filter((o) => o.listingExternalId === listing.externalId)
        .reduce((sum, o) => sum + o.quantity, 0);
      expect(sold).toBe(listing.sales30d);
    }
    for (const product of store.products.filter((p) => p.stock === 0)) {
      const productListings = store.listings.filter((l) => l.sku === product.sku);
      expect(productListings.every((l) => l.status !== 'active')).toBe(true);
    }
  });

  it('only generates orders inside the window', () => {
    const windowStart = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    expect(store.orders.length).toBeGreaterThan(0);
    for (const order of store.orders) {
      expect(order.orderedAt.getTime()).toBeGreaterThan(windowStart);
      expect(order.orderedAt.getTime()).toBeLessThanOrEqual(now.getTime());
    }
  });
});

describe('SimulatedMarketplaceAdapter', () => {
  it('filters by marketplace and date', async () => {
    const adapter = new SimulatedMarketplaceAdapter('shopee', store);
    const listings = await adapter.listListings();
    expect(listings.every((l) => l.marketplace === 'shopee')).toBe(true);

    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const orders = await adapter.listOrders(since);
    expect(orders.every((o) => o.marketplace === 'shopee' && o.orderedAt >= since)).toBe(true);
  });
});
