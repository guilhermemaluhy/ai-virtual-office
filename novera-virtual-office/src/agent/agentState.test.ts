import { describe, expect, it } from 'vitest';
import {
  AGENT_STATUSES,
  DEMO_SEQUENCE,
  isAgentStatus,
  isBusy,
  nextDemoStatus,
  STATUS_COLOR,
  STATUS_LABEL,
} from './agentState.js';
import {
  agentStore,
  resetAgentStore,
  setAgentSelected,
  setAgentStatus,
  toggleAgentSelected,
} from './agentStore.js';

describe('estados do agente', () => {
  it('todo estado tem rótulo e cor', () => {
    for (const status of AGENT_STATUSES) {
      expect(STATUS_LABEL[status]).toBeTruthy();
      expect(STATUS_COLOR[status]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('reconhece estados válidos', () => {
    expect(isAgentStatus('working')).toBe(true);
    expect(isAgentStatus('sleeping')).toBe(false);
    expect(isAgentStatus(3)).toBe(false);
  });

  it('o ciclo de demonstração passa por todos os estados exceto erro e volta ao início', () => {
    let status = DEMO_SEQUENCE[0]!;
    const visited = [status];
    for (let i = 0; i < DEMO_SEQUENCE.length; i += 1) {
      status = nextDemoStatus(status);
      visited.push(status);
    }
    expect(visited.at(-1)).toBe('idle');
    expect(new Set(visited)).toEqual(new Set(DEMO_SEQUENCE));
    expect(nextDemoStatus('error')).toBe('idle');
  });

  it('ocupado = trabalhando, pensando ou executando', () => {
    expect(AGENT_STATUSES.filter(isBusy)).toEqual(['working', 'thinking', 'executing']);
  });
});

describe('agentStore', () => {
  it('muda o estado e registra o instante; repetir o mesmo estado não altera', () => {
    resetAgentStore();
    setAgentStatus('working', 1000);
    expect(agentStore.get().status).toBe('working');
    expect(agentStore.get().statusChangedAt).toBe(1000);
    setAgentStatus('working', 2000);
    expect(agentStore.get().statusChangedAt).toBe(1000);
  });

  it('seleciona e alterna a seleção', () => {
    resetAgentStore();
    toggleAgentSelected();
    expect(agentStore.get().selected).toBe(true);
    setAgentSelected(false);
    expect(agentStore.get().selected).toBe(false);
  });
});
