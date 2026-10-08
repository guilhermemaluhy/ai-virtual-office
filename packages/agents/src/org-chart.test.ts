import { describe, expect, it } from 'vitest';
import { chainOfCommand, directReports, getAgentDefinition, ORG_CHART } from './index.js';

describe('ORG_CHART', () => {
  it('has 13 agents with unique ids', () => {
    expect(ORG_CHART).toHaveLength(13);
    expect(new Set(ORG_CHART.map((a) => a.id)).size).toBe(13);
  });

  it('has a full team per marketplace', () => {
    for (const marketplace of ['mercado_livre', 'shopee'] as const) {
      const roles = ORG_CHART.filter((a) => a.marketplace === marketplace).map((a) => a.role);
      expect(roles.sort()).toEqual(
        ['ads', 'afiliados', 'cadastro', 'campanhas', 'diretor', 'estrategista'].sort(),
      );
    }
  });

  it('puts directors and the shared buyer directly under the CEO', () => {
    expect(directReports(null).map((a) => a.id)).toEqual([
      'ml-diretor',
      'shopee-diretor',
      'comprador',
    ]);
    expect(getAgentDefinition('comprador')?.marketplace).toBeNull();
  });

  it('resolves the chain of command up to the director', () => {
    expect(chainOfCommand('shopee-ads').map((a) => a.id)).toEqual([
      'shopee-estrategista',
      'shopee-diretor',
    ]);
    expect(chainOfCommand('ml-diretor')).toEqual([]);
    expect(() => chainOfCommand('nope')).toThrow(/Unknown agent/);
  });

  it('only references existing managers', () => {
    for (const agent of ORG_CHART) {
      if (agent.reportsTo) expect(getAgentDefinition(agent.reportsTo)).toBeDefined();
    }
  });
});

describe('titles', () => {
  it('match the persona gender and marketplace', () => {
    expect(getAgentDefinition('ml-diretor')).toMatchObject({ name: 'Rafael', title: 'Diretor ML' });
    expect(getAgentDefinition('shopee-diretor')).toMatchObject({
      name: 'Marina',
      title: 'Diretora Shopee',
    });
    expect(getAgentDefinition('comprador')?.title).toBe('Comprador / Analista de Estoque');
  });
});
