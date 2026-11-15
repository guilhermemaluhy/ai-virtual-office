import { MICRO_USD_PER_USD, type EmployeeState } from '@aivo/shared';

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const usdFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const integerFormatter = new Intl.NumberFormat('pt-BR');
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export const brl = (cents: number) => brlFormatter.format(cents / 100);
export const usdFromMicro = (microUsd: number) => usdFormatter.format(microUsd / MICRO_USD_PER_USD);
export const integer = (value: number) => integerFormatter.format(value);
export const dateTime = (value: string | Date) => dateTimeFormatter.format(new Date(value));

export const STATE_LABELS: Record<EmployeeState, string> = {
  idle: 'Disponível',
  working: 'Trabalhando',
  meeting: 'Em reunião',
  awaiting_approval: 'Aguardando sua aprovação',
  alert: 'Alerta',
  offline: 'Offline',
};
