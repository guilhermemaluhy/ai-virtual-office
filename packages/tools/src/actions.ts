import { type AgentRole, type RiskLevel, riskRank } from '@aivo/shared';

export interface ActionDefinition {
  /** Stable id stored in `approvals.action`. */
  id: string;
  label: string;
  risk: RiskLevel;
  /** Roles allowed to propose this action. */
  proposers: readonly AgentRole[];
  /** Only the human CEO may approve, whatever the configured autonomy (e.g. prices). */
  ceoOnly: boolean;
}

/** Everything agents can propose that changes the business. */
export const ACTIONS = {
  'listing.change_price': {
    id: 'listing.change_price',
    label: 'Mudar preço de anúncio',
    risk: 'high',
    proposers: ['estrategista'],
    ceoOnly: true,
  },
  'purchase.create_order': {
    id: 'purchase.create_order',
    label: 'Criar pedido de compra',
    risk: 'high',
    proposers: ['comprador'],
    ceoOnly: false,
  },
  'ads.set_daily_budget': {
    id: 'ads.set_daily_budget',
    label: 'Mudar orçamento diário de Ads',
    risk: 'medium',
    proposers: ['ads'],
    ceoOnly: false,
  },
  'campaign.join': {
    id: 'campaign.join',
    label: 'Aderir a campanha promocional',
    risk: 'high',
    proposers: ['campanhas'],
    ceoOnly: false,
  },
  'affiliates.add_products': {
    id: 'affiliates.add_products',
    label: 'Incluir produtos no programa de afiliados',
    risk: 'low',
    proposers: ['afiliados'],
    ceoOnly: false,
  },
  'listing.update_content': {
    id: 'listing.update_content',
    label: 'Atualizar título/descrição de anúncio',
    risk: 'medium',
    proposers: ['cadastro'],
    ceoOnly: false,
  },
} as const satisfies Record<string, ActionDefinition>;

export type ActionId = keyof typeof ACTIONS;

export const isActionId = (value: string): value is ActionId => value in ACTIONS;

export type Route =
  /** Within the agent's autonomy: run it and log it. */
  | { kind: 'execute' }
  /** Needs a decision; `approver` is `ceo` (the only approver for now). */
  | { kind: 'approval'; approver: 'ceo' };

/**
 * Decides whether an agent may run an action alone or must ask.
 * Today every approval goes to the CEO; delegating to directors comes with configurable alçadas.
 */
export function routeAction(
  action: ActionDefinition,
  agent: { role: AgentRole; autonomy: RiskLevel },
): Route {
  if (!action.proposers.includes(agent.role)) {
    throw new Error(`Cargo "${agent.role}" não pode propor "${action.id}"`);
  }
  if (action.ceoOnly) return { kind: 'approval', approver: 'ceo' };
  return riskRank(action.risk) <= riskRank(agent.autonomy)
    ? { kind: 'execute' }
    : { kind: 'approval', approver: 'ceo' };
}
