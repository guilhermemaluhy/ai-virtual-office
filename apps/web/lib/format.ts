import { type AgentState, MARKETPLACE_LABELS, type Marketplace } from '@aivo/shared';

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compactBrlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integerFormatter = new Intl.NumberFormat('pt-BR');

export const brl = (cents: number) => brlFormatter.format(cents / 100);
export const compactBrl = (cents: number) => compactBrlFormatter.format(cents / 100);
export const integer = (value: number) => integerFormatter.format(value);

export const marketplaceLabel = (marketplace: Marketplace | null) =>
  marketplace ? MARKETPLACE_LABELS[marketplace] : 'Compartilhado';

export const STATE_LABELS: Record<AgentState, string> = {
  idle: 'Disponível',
  working: 'Trabalhando',
  meeting: 'Em reunião',
  awaiting_approval: 'Aguardando sua aprovação',
  alert: 'Alerta',
  offline: 'Offline',
};
