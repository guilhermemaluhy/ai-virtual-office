/** Domain vocabulary shared by db, agents, API and web. */

export const MARKETPLACES = ['mercado_livre', 'shopee'] as const;
export type Marketplace = (typeof MARKETPLACES)[number];

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  mercado_livre: 'Mercado Livre',
  shopee: 'Shopee',
};

export const AGENT_ROLES = [
  'diretor',
  'estrategista',
  'cadastro',
  'ads',
  'afiliados',
  'campanhas',
  'atendimento',
  'comprador',
] as const;
export type AgentRole = (typeof AGENT_ROLES)[number];

export const AGENT_STATES = [
  'idle',
  'working',
  'meeting',
  'awaiting_approval',
  'alert',
  'offline',
] as const;
export type AgentState = (typeof AGENT_STATES)[number];

/** Ordered from least to most risky. */
export const RISK_LEVELS = ['read', 'low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const riskRank = (level: RiskLevel): number => RISK_LEVELS.indexOf(level);

export const LISTING_STATUSES = ['active', 'paused', 'draft'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const REPORT_KINDS = ['marketplace_daily', 'ceo_summary'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

/** Actor id used for decisions taken by the human CEO. */
export const CEO_ACTOR = 'ceo';
