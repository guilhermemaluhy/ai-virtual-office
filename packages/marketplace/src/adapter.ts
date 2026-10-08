import type { ListingStatus, Marketplace } from '@aivo/shared';

export interface CatalogProduct {
  sku: string;
  title: string;
  category: string;
  costCents: number;
  stock: number;
}

export interface MarketplaceListing {
  sku: string;
  marketplace: Marketplace;
  externalId: string;
  title: string;
  priceCents: number;
  status: ListingStatus;
  qualityScore: number;
  visits30d: number;
  sales30d: number;
}

export interface MarketplaceOrder {
  marketplace: Marketplace;
  externalId: string;
  listingExternalId: string;
  quantity: number;
  totalCents: number;
  orderedAt: Date;
}

/**
 * Read side of a marketplace integration. Write actions (publish, reprice, …)
 * are added with the real integrations, always behind approvals.
 */
export interface MarketplaceAdapter {
  readonly marketplace: Marketplace;
  listListings(): Promise<MarketplaceListing[]>;
  listOrders(since: Date): Promise<MarketplaceOrder[]>;
}
