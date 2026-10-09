import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { agentStore, resetAgentStore } from '../agent/agentStore.js';
import { AgentChip } from './AgentChip.js';
import { StatusSimulator } from './StatusSimulator.js';

describe('StatusSimulator', () => {
  beforeEach(() => resetAgentStore());

  it('troca o estado do agente ao clicar', () => {
    render(<StatusSimulator />);
    fireEvent.click(screen.getByRole('button', { name: 'Executando tarefa' }));
    expect(agentStore.get().status).toBe('executing');
    expect(screen.getByRole('button', { name: 'Executando tarefa' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('deixa claro que é simulação', () => {
    render(<StatusSimulator />);
    expect(screen.getByText(/sem IA/i)).toBeInTheDocument();
  });
});

describe('AgentChip', () => {
  beforeEach(() => resetAgentStore());

  it('mostra nome, função e status, e alterna a seleção', () => {
    render(<AgentChip />);
    const chip = screen.getByRole('button');
    expect(chip).toHaveTextContent('Nova');
    expect(chip).toHaveTextContent('Assistente de Operações');
    expect(chip).toHaveTextContent('Ocioso');
    fireEvent.click(chip);
    expect(agentStore.get().selected).toBe(true);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});
