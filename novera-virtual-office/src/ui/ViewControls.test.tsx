import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ViewControls } from './ViewControls.js';

describe('ViewControls', () => {
  it('chama onResetView ao clicar em "Visão inicial"', () => {
    const onResetView = vi.fn();
    render(<ViewControls onResetView={onResetView} onFocusAgent={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /visão inicial/i }));
    expect(onResetView).toHaveBeenCalledTimes(1);
  });

  it('chama onFocusAgent ao clicar em "Agente"', () => {
    const onFocusAgent = vi.fn();
    render(<ViewControls onResetView={() => undefined} onFocusAgent={onFocusAgent} />);
    fireEvent.click(screen.getByRole('button', { name: /agente/i }));
    expect(onFocusAgent).toHaveBeenCalledTimes(1);
  });

  it('alterna a ajuda de atalhos', () => {
    render(<ViewControls onResetView={() => undefined} onFocusAgent={() => undefined} />);
    const toggle = screen.getByRole('button', { name: /atalhos/i });
    expect(screen.queryByText(/Teclado:/)).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText(/Teclado:/)).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
