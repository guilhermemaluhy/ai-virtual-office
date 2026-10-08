import type { ListingStatus, Marketplace } from '@aivo/shared';
import type { ActionId } from '@aivo/tools';

export interface ProductData {
  sku: string;
  title: string;
  costCents: number;
  stock: number;
}

export interface ListingData {
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

export interface StoreData {
  products: ProductData[];
  listings: ListingData[];
}

/** Something an agent wants to do this cycle. */
export type Proposal =
  | {
      kind: 'task';
      agentId: string;
      key: string;
      title: string;
      details?: string;
    }
  | {
      kind: 'action';
      agentId: string;
      key: string;
      action: ActionId;
      summary: string;
      payload: Record<string, unknown>;
    };
