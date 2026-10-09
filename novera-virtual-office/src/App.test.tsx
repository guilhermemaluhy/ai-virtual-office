import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';

describe('App', () => {
  it('mostra mensagem amigável quando WebGL não está disponível', () => {
    render(<App webglAvailable={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent('não suporta WebGL 2');
    expect(screen.getByRole('status')).toHaveTextContent('WebGL indisponível');
    expect(screen.getByText('Novera Virtual Office')).toBeInTheDocument();
  });
});
