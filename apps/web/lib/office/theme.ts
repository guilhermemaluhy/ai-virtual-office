import type { AgentRole, Marketplace } from '@aivo/shared';

/** Scene palette. Marketplace colors are muted versions of the brands. */
export const PALETTE = {
  background: '#eef1f6',
  floorBase: '#f7f5f0',
  wall: '#e4e7ee',
  wallTrim: '#cfd5e1',
  wood: '#c9a27a',
  woodDark: '#9c7a57',
  desk: '#f2efe9',
  deskLeg: '#8d96a8',
  monitorOff: '#2b2f3a',
  monitorOn: '#8fd3ff',
  glass: '#bfe3f2',
  skin: ['#f1c9a5', '#d9a77f', '#b07a53', '#8d5a3b'],
  hair: ['#3b2a20', '#1f1b18', '#6b4a2e', '#a5743f', '#2c2c34'],
  ceo: '#7a5bd6',
  ceoAccent: '#d9b44a',
  alert: '#ef5b5b',
  attention: '#ffc93c',
  shared: '#7d93ad',
} as const;

export const MARKETPLACE_COLORS: Record<
  Marketplace,
  { floor: string; shirt: string; accent: string }
> = {
  mercado_livre: { floor: '#fff1b8', shirt: '#f5c400', accent: '#2d3277' },
  shopee: { floor: '#ffd9c7', shirt: '#ee5a2f', accent: '#ffffff' },
};

export const SHARED_COLORS = { floor: '#dfe6ee', shirt: PALETTE.shared, accent: '#ffffff' };

export const ROLE_ICONS: Record<AgentRole, string> = {
  diretor: '👔',
  estrategista: '📈',
  cadastro: '📦',
  ads: '📣',
  afiliados: '🤝',
  campanhas: '🏷️',
  atendimento: '🎧',
  comprador: '📋',
};

export const ROLE_SHORT: Record<AgentRole, string> = {
  diretor: 'Diretoria',
  estrategista: 'Estratégia',
  cadastro: 'Cadastro',
  ads: 'Ads',
  afiliados: 'Afiliados',
  campanhas: 'Campanhas',
  atendimento: 'Atendimento',
  comprador: 'Compras/Estoque',
};

export const colorsFor = (marketplace: Marketplace | null) =>
  marketplace ? MARKETPLACE_COLORS[marketplace] : SHARED_COLORS;

/** Deterministic pick so each agent keeps the same look. */
export function pickFor<T>(id: string, options: readonly T[]): T {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const option = options[hash % options.length];
  if (option === undefined) throw new Error('pickFor needs at least one option');
  return option;
}
