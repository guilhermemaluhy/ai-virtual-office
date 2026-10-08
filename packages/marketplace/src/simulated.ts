import type { ListingStatus, Marketplace } from '@aivo/shared';
import type {
  CatalogProduct,
  MarketplaceAdapter,
  MarketplaceListing,
  MarketplaceOrder,
} from './adapter.js';
import { CATALOG_TEMPLATES, VARIANTS } from './catalog.js';
import { Random } from './random.js';

export interface SimulatedStoreOptions {
  seed?: number;
  productCount?: number;
  /** Days of order history to generate. */
  days?: number;
  now?: Date;
}

export interface SimulatedStore {
  products: CatalogProduct[];
  listings: MarketplaceListing[];
  orders: MarketplaceOrder[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const MARKETPLACE_PROFILE: Record<
  Marketplace,
  { priceFactor: number; demandFactor: number; conversion: [number, number] }
> = {
  mercado_livre: { priceFactor: 1, demandFactor: 1, conversion: [0.015, 0.06] },
  shopee: { priceFactor: 0.93, demandFactor: 0.8, conversion: [0.01, 0.045] },
};

function externalListingId(marketplace: Marketplace, index: number): string {
  return marketplace === 'mercado_livre'
    ? `MLB${String(3_000_000_000 + index * 7919)}`
    : `SHP${String(20_000_000 + index * 104_729)}`;
}

/**
 * Generates a realistic, deterministic store: products with a single shared stock,
 * listed on Mercado Livre and/or Shopee, with `days` of order history.
 */
export function generateSimulatedStore(options: SimulatedStoreOptions = {}): SimulatedStore {
  const { seed = 42, productCount = 100, days = 30, now = new Date() } = options;
  const random = new Random(seed);

  const products: CatalogProduct[] = [];
  const listings: MarketplaceListing[] = [];
  const orders: MarketplaceOrder[] = [];

  for (let i = 0; i < productCount; i++) {
    const template = random.pick(CATALOG_TEMPLATES);
    const [name, costBrl] = random.pick(template.items);
    const variant = random.pick(VARIANTS);
    const sku = `SKU-${String(i + 1).padStart(4, '0')}`;
    const costCents = Math.round(costBrl * 100 * random.float(0.85, 1.15));
    // ~6% of products are out of stock, a few are low.
    const stock = random.chance(0.06)
      ? 0
      : random.chance(0.12)
        ? random.int(1, 5)
        : random.int(6, 250);

    products.push({
      sku,
      title: `${name} ${variant}`,
      category: template.category,
      costCents,
      stock,
    });

    // Pareto-like popularity: a few products sell a lot.
    const popularity = Math.pow(random.next(), 3) * 4;
    const markup = random.float(1.5, 2.6);

    const onBoth = random.chance(0.85);
    const marketplaces: Marketplace[] = onBoth
      ? ['mercado_livre', 'shopee']
      : [random.pick(['mercado_livre', 'shopee'] as const)];

    for (const marketplace of marketplaces) {
      const profile = MARKETPLACE_PROFILE[marketplace];
      const externalId = externalListingId(marketplace, i + 1);
      // Round to whole reais and end in ,90.
      const priceCents = Math.round((costCents * markup * profile.priceFactor) / 100) * 100 - 10;

      let status: ListingStatus = 'active';
      if (stock === 0 || random.chance(0.04)) status = 'paused';
      else if (random.chance(0.03)) status = 'draft';

      let sales30d = 0;
      if (status !== 'draft') {
        for (let day = 0; day < days; day++) {
          // Paused listings only sold before they were paused (first half of the window).
          if (status === 'paused' && day < days / 2) continue;
          const expected = popularity * profile.demandFactor;
          let dailyOrders = Math.floor(expected);
          if (random.chance(expected - dailyOrders)) dailyOrders++;
          for (let o = 0; o < dailyOrders; o++) {
            const quantity = random.chance(0.85) ? 1 : random.int(2, 3);
            const orderedAt = new Date(now.getTime() - day * DAY_MS - random.int(0, DAY_MS - 1));
            orders.push({
              marketplace,
              externalId: `${externalId}-O${String(orders.length + 1).padStart(6, '0')}`,
              listingExternalId: externalId,
              quantity,
              totalCents: quantity * priceCents,
              orderedAt,
            });
            sales30d += quantity;
          }
        }
      }

      const conversion = random.float(...profile.conversion);
      const visits30d =
        status === 'draft'
          ? 0
          : Math.max(sales30d, Math.round(sales30d / conversion) + random.int(5, 60));

      listings.push({
        sku,
        marketplace,
        externalId,
        title: `${name} ${variant}`,
        priceCents,
        status,
        qualityScore: status === 'draft' ? random.int(20, 55) : random.int(45, 100),
        visits30d,
        sales30d,
      });
    }
  }

  orders.sort((a, b) => b.orderedAt.getTime() - a.orderedAt.getTime());
  return { products, listings, orders };
}

export class SimulatedMarketplaceAdapter implements MarketplaceAdapter {
  constructor(
    readonly marketplace: Marketplace,
    private readonly store: SimulatedStore,
  ) {}

  listListings(): Promise<MarketplaceListing[]> {
    return Promise.resolve(this.store.listings.filter((l) => l.marketplace === this.marketplace));
  }

  listOrders(since: Date): Promise<MarketplaceOrder[]> {
    return Promise.resolve(
      this.store.orders.filter(
        (o) => o.marketplace === this.marketplace && o.orderedAt.getTime() >= since.getTime(),
      ),
    );
  }
}
