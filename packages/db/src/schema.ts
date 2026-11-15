/**
 * Drizzle mirror of the SQL in `supabase/migrations` (the source of truth), used for
 * typed queries in the API and the worker. `schema.test.ts` fails if the two drift.
 */
import {
  APPROVAL_STATUSES,
  AUTONOMY_LEVELS,
  DEFAULT_ORGANIZATION_ID,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATES,
  MARKETPLACES,
  RISK_LEVELS,
  TASK_STATUSES,
  type AiModel,
} from '@aivo/shared';
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const marketplaceEnum = pgEnum('marketplace', MARKETPLACES);
export const employeeRoleEnum = pgEnum('employee_role', EMPLOYEE_ROLES);
export const employeeStateEnum = pgEnum('employee_state', EMPLOYEE_STATES);
export const autonomyLevelEnum = pgEnum('autonomy_level', AUTONOMY_LEVELS);
export const riskLevelEnum = pgEnum('risk_level', RISK_LEVELS);
export const taskStatusEnum = pgEnum('task_status', TASK_STATUSES);
export const approvalStatusEnum = pgEnum('approval_status', APPROVAL_STATUSES);

/** Supabase Auth. Only the columns we reference. */
export const authSchema = pgSchema('auth');
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
});

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => timestamptz('created_at').notNull().defaultNow();
const updatedAt = () => timestamptz('updated_at').notNull().defaultNow();
const organizationId = () =>
  uuid('organization_id')
    .notNull()
    .default(DEFAULT_ORGANIZATION_ID)
    .references(() => organizations.id);
const jsonObject = (name: string) =>
  jsonb(name).$type<Record<string, unknown>>().notNull().default({});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: createdAt(),
});

export const owners = pgTable('owners', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  organizationId: organizationId(),
  name: text('name'),
  createdAt: createdAt(),
});

/** One row per organization. `paused` is the global stop switch. */
export const officeSettings = pgTable('office_settings', {
  organizationId: uuid('organization_id')
    .primaryKey()
    .references(() => organizations.id),
  paused: boolean('paused').notNull().default(false),
  pausedAt: timestamptz('paused_at'),
  pausedBy: uuid('paused_by').references(() => authUsers.id, { onDelete: 'set null' }),
  pauseReason: text('pause_reason'),
  updatedAt: updatedAt(),
});

export const employees = pgTable(
  'employees',
  {
    /** Stable slug, e.g. `analista-estoque`. */
    id: text('id').primaryKey(),
    organizationId: organizationId(),
    role: employeeRoleEnum('role').notNull(),
    name: text('name').notNull(),
    title: text('title').notNull(),
    avatar: jsonObject('avatar'),
    goal: text('goal').notNull(),
    systemPrompt: text('system_prompt').notNull(),
    model: text('model').$type<AiModel>().notNull(),
    allowedTools: text('allowed_tools').array().notNull().default([]),
    autonomy: autonomyLevelEnum('autonomy').notNull().default('simulacao'),
    /** Cron expressions (America/Sao_Paulo). */
    schedule: jsonb('schedule').$type<string[]>().notNull().default([]),
    /** 0 = no limit. */
    dailyBudgetMicroUsd: bigint('daily_budget_micro_usd', { mode: 'number' }).notNull().default(0),
    state: employeeStateEnum('state').notNull().default('offline'),
    active: boolean('active').notNull().default(true),
    hiredAt: timestamptz('hired_at').notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('employees_organization_id_role_key').on(table.organizationId, table.role),
  ],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    employeeId: text('employee_id')
      .notNull()
      .references(() => employees.id),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    details: text('details'),
    input: jsonObject('input'),
    output: jsonb('output').$type<Record<string, unknown>>(),
    status: taskStatusEnum('status').notNull().default('queued'),
    /** `dono`, `gestor`, `agenda` or `sistema`. */
    requestedBy: text('requested_by').notNull().default('sistema'),
    scheduledFor: timestamptz('scheduled_for'),
    startedAt: timestamptz('started_at'),
    finishedAt: timestamptz('finished_at'),
    error: text('error'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('tasks_employee_status_idx').on(table.employeeId, table.status),
    index('tasks_created_at_idx').on(table.createdAt),
  ],
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    employeeId: text('employee_id')
      .notNull()
      .references(() => employees.id),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    summary: text('summary').notNull(),
    risk: riskLevelEnum('risk').notNull(),
    payload: jsonObject('payload'),
    before: jsonb('before').$type<Record<string, unknown>>(),
    after: jsonb('after').$type<Record<string, unknown>>(),
    status: approvalStatusEnum('status').notNull().default('pending'),
    decidedBy: uuid('decided_by').references(() => authUsers.id, { onDelete: 'set null' }),
    decisionNote: text('decision_note'),
    /** Set when the owner edits the proposal before approving it. */
    editedPayload: jsonb('edited_payload').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    decidedAt: timestamptz('decided_at'),
    undoneAt: timestamptz('undone_at'),
  },
  (table) => [index('approvals_status_idx').on(table.status, table.createdAt)],
);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    employeeId: text('employee_id').references(() => employees.id),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    /** Markdown in plain Portuguese. */
    content: text('content').notNull(),
    data: jsonObject('data'),
    periodStart: date('period_start'),
    periodEnd: date('period_end'),
    readAt: timestamptz('read_at'),
    createdAt: createdAt(),
  },
  (table) => [index('reports_created_at_idx').on(table.createdAt)],
);

export const employeeMemory = pgTable(
  'employee_memory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    employeeId: text('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    content: text('content').notNull(),
    importance: smallint('importance').notNull().default(0),
    metadata: jsonObject('metadata'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex('employee_memory_employee_id_key_key').on(table.employeeId, table.key)],
);

export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    employeeId: text('employee_id')
      .notNull()
      .references(() => employees.id),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    model: text('model').$type<AiModel>().notNull(),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    cacheReadTokens: integer('cache_read_tokens').notNull().default(0),
    cacheWriteTokens: integer('cache_write_tokens').notNull().default(0),
    costMicroUsd: bigint('cost_micro_usd', { mode: 'number' }).notNull().default(0),
    durationMs: integer('duration_ms'),
    createdAt: createdAt(),
  },
  (table) => [index('ai_usage_employee_created_idx').on(table.employeeId, table.createdAt)],
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: organizationId(),
    /** `dono`, `sistema` or an employee id. */
    actor: text('actor').notNull(),
    actorUserId: uuid('actor_user_id').references(() => authUsers.id, { onDelete: 'set null' }),
    employeeId: text('employee_id').references(() => employees.id),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    before: jsonb('before').$type<Record<string, unknown>>(),
    after: jsonb('after').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (table) => [
    index('audit_log_entity_idx').on(table.entity, table.entityId),
    index('audit_log_created_at_idx').on(table.createdAt),
  ],
);

/** Every public table, keyed by its SQL name (used by the drift test and tooling). */
export const PUBLIC_TABLES = {
  organizations,
  owners,
  office_settings: officeSettings,
  employees,
  tasks,
  approvals,
  reports,
  employee_memory: employeeMemory,
  ai_usage: aiUsage,
  audit_log: auditLog,
} as const;

export type OrganizationRow = typeof organizations.$inferSelect;
export type OwnerRow = typeof owners.$inferSelect;
export type OfficeSettingsRow = typeof officeSettings.$inferSelect;
export type EmployeeRow = typeof employees.$inferSelect;
export type NewEmployeeRow = typeof employees.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type ApprovalRow = typeof approvals.$inferSelect;
export type NewApprovalRow = typeof approvals.$inferInsert;
export type ReportRow = typeof reports.$inferSelect;
export type NewReportRow = typeof reports.$inferInsert;
export type EmployeeMemoryRow = typeof employeeMemory.$inferSelect;
export type AiUsageRow = typeof aiUsage.$inferSelect;
export type NewAiUsageRow = typeof aiUsage.$inferInsert;
export type AuditLogRow = typeof auditLog.$inferSelect;
export type NewAuditLogRow = typeof auditLog.$inferInsert;
