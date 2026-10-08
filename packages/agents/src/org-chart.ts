import { type AgentRole, type Marketplace, MARKETPLACES } from '@aivo/shared';

export interface AgentDefinition {
  /** Stable key, e.g. `ml-diretor`. */
  id: string;
  /** Persona name shown in the office. */
  name: string;
  role: AgentRole;
  /** Job title shown to the CEO. */
  title: string;
  /** `null` for agents shared by every marketplace. */
  marketplace: Marketplace | null;
  /** `null` means the agent reports to the human CEO. */
  reportsTo: string | null;
}

type Gender = 'm' | 'f';

/** Job titles by role, masculine and feminine forms. */
export const ROLE_LABELS: Record<AgentRole, Record<Gender, string>> = {
  diretor: { m: 'Diretor', f: 'Diretora' },
  estrategista: { m: 'Especialista Estratégico', f: 'Especialista Estratégica' },
  cadastro: { m: 'Analista de Cadastro', f: 'Analista de Cadastro' },
  ads: { m: 'Analista de Ads', f: 'Analista de Ads' },
  afiliados: { m: 'Analista de Afiliados', f: 'Analista de Afiliados' },
  campanhas: { m: 'Analista de Campanhas', f: 'Analista de Campanhas' },
  atendimento: { m: 'Analista de Atendimento', f: 'Analista de Atendimento' },
  comprador: { m: 'Comprador / Analista de Estoque', f: 'Compradora / Analista de Estoque' },
};

const MARKETPLACE_PREFIX: Record<Marketplace, string> = { mercado_livre: 'ml', shopee: 'shopee' };
const MARKETPLACE_SHORT: Record<Marketplace, string> = { mercado_livre: 'ML', shopee: 'Shopee' };

const ANALYST_ROLES = ['cadastro', 'ads', 'afiliados', 'campanhas', 'atendimento'] as const;

const PERSONAS: Record<
  Marketplace,
  Record<Exclude<AgentRole, 'comprador'>, readonly [name: string, gender: Gender]>
> = {
  mercado_livre: {
    diretor: ['Rafael', 'm'],
    estrategista: ['Camila', 'f'],
    cadastro: ['Lucas', 'm'],
    ads: ['Bianca', 'f'],
    afiliados: ['Thiago', 'm'],
    campanhas: ['Juliana', 'f'],
    atendimento: ['Patrícia', 'f'],
  },
  shopee: {
    diretor: ['Marina', 'f'],
    estrategista: ['Bruno', 'm'],
    cadastro: ['Larissa', 'f'],
    ads: ['Diego', 'm'],
    afiliados: ['Fernanda', 'f'],
    campanhas: ['Gustavo', 'm'],
    atendimento: ['Rodrigo', 'm'],
  },
};

export const agentId = (marketplace: Marketplace | null, role: AgentRole): string =>
  marketplace ? `${MARKETPLACE_PREFIX[marketplace]}-${role}` : role;

function marketplaceTeam(marketplace: Marketplace): AgentDefinition[] {
  const personas = PERSONAS[marketplace];
  const short = MARKETPLACE_SHORT[marketplace];
  const define = (
    role: Exclude<AgentRole, 'comprador'>,
    reportsTo: string | null,
  ): AgentDefinition => {
    const [name, gender] = personas[role];
    return {
      id: agentId(marketplace, role),
      name,
      role,
      title: `${ROLE_LABELS[role][gender]} ${short}`,
      marketplace,
      reportsTo,
    };
  };

  const director = define('diretor', null);
  const strategist = define('estrategista', director.id);
  return [director, strategist, ...ANALYST_ROLES.map((role) => define(role, strategist.id))];
}

/**
 * The company: per marketplace one director, one strategist and five analysts;
 * a shared buyer; everyone ultimately reports to the human CEO.
 */
export const ORG_CHART: readonly AgentDefinition[] = [
  ...MARKETPLACES.flatMap(marketplaceTeam),
  {
    id: agentId(null, 'comprador'),
    name: 'Paulo',
    role: 'comprador',
    title: ROLE_LABELS.comprador.m,
    marketplace: null,
    reportsTo: null,
  },
];

export function getAgentDefinition(id: string): AgentDefinition | undefined {
  return ORG_CHART.find((agent) => agent.id === id);
}

export function directReports(id: string | null): AgentDefinition[] {
  return ORG_CHART.filter((agent) => agent.reportsTo === id);
}

/** Managers above `id`, closest first. The CEO (top) is implicit and not included. */
export function chainOfCommand(id: string): AgentDefinition[] {
  const chain: AgentDefinition[] = [];
  let current = getAgentDefinition(id);
  if (!current) throw new Error(`Unknown agent "${id}"`);
  while (current.reportsTo) {
    const manager = getAgentDefinition(current.reportsTo);
    if (!manager)
      throw new Error(`Agent "${current.id}" reports to unknown "${current.reportsTo}"`);
    chain.push(manager);
    current = manager;
  }
  return chain;
}
