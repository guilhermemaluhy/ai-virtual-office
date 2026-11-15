/**
 * Domain vocabulary shared by db, agents, API, worker and web (v4).
 * The Postgres enums in `supabase/migrations` mirror these lists; a test in
 * `@aivo/db` fails when they drift apart.
 */

/** Sales channels the store operates. Bling is the ERP (source of truth), not a channel. */
export const MARKETPLACES = ['mercado_livre', 'shopee'] as const;
export type Marketplace = (typeof MARKETPLACES)[number];

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  mercado_livre: 'Mercado Livre',
  shopee: 'Shopee',
};

/** The six employees of the store (see docs/FUNCIONARIOS.md). One per role. */
export const EMPLOYEE_ROLES = [
  'analista_estoque',
  'gestor',
  'catalogo_anuncios',
  'preco_margem',
  'sac',
  'analista_mercado',
] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  analista_estoque: 'Analista de Estoque',
  gestor: 'Gestor',
  catalogo_anuncios: 'Catálogo e Anúncios',
  preco_margem: 'Preço e Margem',
  sac: 'SAC',
  analista_mercado: 'Analista de Mercado',
};

/** What the 3D office shows. `working` only exists while a real task runs. */
export const EMPLOYEE_STATES = [
  'idle',
  'working',
  'awaiting_approval',
  'meeting',
  'alert',
  'offline',
] as const;
export type EmployeeState = (typeof EMPLOYEE_STATES)[number];

/**
 * Rule 4 of CLAUDE.md: every write to the store climbs these levels in order,
 * and only the owner moves an employee up.
 */
export const AUTONOMY_LEVELS = ['simulacao', 'aprovacao', 'autonomo'] as const;
export type AutonomyLevel = (typeof AUTONOMY_LEVELS)[number];

export const AUTONOMY_LABELS: Record<AutonomyLevel, string> = {
  simulacao: 'Simulação (só registra o que faria)',
  aprovacao: 'Aprovação (o dono aprova cada ação)',
  autonomo: 'Autônomo dentro de faixas',
};

/** Ordered from least to most risky. */
export const RISK_LEVELS = ['read', 'low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const riskRank = (level: RiskLevel): number => RISK_LEVELS.indexOf(level);

export const TASK_STATUSES = ['queued', 'running', 'done', 'failed', 'cancelled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** `undone` = approved, executed and then reverted by the owner with one click. */
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'undone'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** Claude models an employee may run on. */
export const AI_MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5'] as const;
export type AiModel = (typeof AI_MODELS)[number];

/** Actor recorded in `audit_log` for decisions taken by the human owner. */
export const OWNER_ACTOR = 'dono';
/** Actor recorded in `audit_log` for automatic changes (triggers, scheduler). */
export const SYSTEM_ACTOR = 'sistema';

/**
 * The platform serves one company. The column stays on every table so a second
 * company can be added later without a rewrite.
 */
export const DEFAULT_ORGANIZATION_ID = '00000000-0000-4000-8000-000000000001';

/** 1 USD = 1_000_000 micro-dollars. AI cost is stored as an integer in this unit. */
export const MICRO_USD_PER_USD = 1_000_000;
