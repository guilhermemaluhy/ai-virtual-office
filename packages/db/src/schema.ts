import {
  AGENT_ROLES,
  AGENT_STATES,
  APPROVAL_STATUSES,
  LISTING_STATUSES,
  MARKETPLACES,
  REPORT_KINDS,
  RISK_LEVELS,
  TASK_STATUSES,
} from '@aivo/shared';
import {
  type AnyPgColumn,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const marketplaceEnum = pgEnum('marketplace', MARKETPLACES);
export const agentRoleEnum = pgEnum('agent_role', AGENT_ROLES);
export const agentStateEnum = pgEnum('agent_state', AGENT_STATES);
export const riskLevelEnum = pgEnum('risk_level', RISK_LEVELS);
export const listingStatusEnum = pgEnum('listing_status', LISTING_STATUSES);
export const taskStatusEnum = pgEnum('task_status', TASK_STATUSES);
export const approvalStatusEnum = pgEnum('approval_status', APPROVAL_STATUSES);
export const reportKindEnum = pgEnum('report_kind', REPORT_KINDS);

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const agents = pgTable('agents', {
  /** Stable, human-readable key, e.g. `ml-diretor`. */
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  role: agentRoleEnum('role').notNull(),
  /** `null` for agents shared by every marketplace (e.g. the buyer). */
  marketplace: marketplaceEnum('marketplace'),
  /** `null` means the agent reports directly to the human CEO. */
  reportsTo: text('reports_to').references((): AnyPgColumn => agents.id),
  state: agentStateEnum('state').notNull().default('idle'),
  /** Highest risk level the agent may execute without approval. */
  autonomy: riskLevelEnum('autonomy').notNull().default('read'),
  createdAt: createdAt(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: text('sku').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  costCents: integer('cost_cents').notNull(),
  /** Single stock shared by every marketplace. */
  stock: integer('stock').notNull(),
  createdAt: createdAt(),
});

export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    marketplace: marketplaceEnum('marketplace').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    priceCents: integer('price_cents').notNull(),
    status: listingStatusEnum('status').notNull(),
    /** Listing completeness, 0–100. */
    qualityScore: integer('quality_score').notNull(),
    visits30d: integer('visits_30d').notNull().default(0),
    sales30d: integer('sales_30d').notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('listings_marketplace_external_id_idx').on(table.marketplace, table.externalId),
    index('listings_product_id_idx').on(table.productId),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    marketplace: marketplaceEnum('marketplace').notNull(),
    externalId: text('external_id').notNull(),
    quantity: integer('quantity').notNull(),
    totalCents: integer('total_cents').notNull(),
    orderedAt: timestamp('ordered_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('orders_marketplace_external_id_idx').on(table.marketplace, table.externalId),
    index('orders_listing_id_idx').on(table.listingId),
  ],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id),
    title: text('title').notNull(),
    details: text('details'),
    /** Deduplication key set by the agent engine (same key → same piece of work). */
    key: text('key'),
    status: taskStatusEnum('status').notNull().default('todo'),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('tasks_agent_id_idx').on(table.agentId), index('tasks_key_idx').on(table.key)],
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestedBy: text('requested_by')
      .notNull()
      .references(() => agents.id),
    action: text('action').notNull(),
    summary: text('summary').notNull(),
    risk: riskLevelEnum('risk').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    /** Deduplication key set by the agent engine (same key → same proposal). */
    key: text('key'),
    status: approvalStatusEnum('status').notNull().default('pending'),
    /** Agent id or `ceo`. */
    decidedBy: text('decided_by'),
    decisionNote: text('decision_note'),
    createdAt: createdAt(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
  },
  (table) => [
    index('approvals_status_idx').on(table.status),
    index('approvals_key_idx').on(table.key),
  ],
);

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: reportKindEnum('kind').notNull(),
  marketplace: marketplaceEnum('marketplace'),
  authorId: text('author_id').references(() => agents.id),
  content: text('content').notNull(),
  createdAt: createdAt(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Agent id or `ceo`. */
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  before: jsonb('before'),
  after: jsonb('after'),
  createdAt: createdAt(),
});

export type AgentRow = typeof agents.$inferSelect;
export type NewAgentRow = typeof agents.$inferInsert;
export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ListingRow = typeof listings.$inferSelect;
export type NewListingRow = typeof listings.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type ApprovalRow = typeof approvals.$inferSelect;
export type NewApprovalRow = typeof approvals.$inferInsert;
export type ReportRow = typeof reports.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
