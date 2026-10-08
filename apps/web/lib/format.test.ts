import { describe, expect, it } from 'vitest';
import { brl, marketplaceLabel } from './format';

describe('format', () => {
  it('formats money in BRL', () => {
    expect(brl(12590).replace(/\s/g, ' ')).toBe('R$ 125,90');
  });

  it('labels marketplaces', () => {
    expect(marketplaceLabel('mercado_livre')).toBe('Mercado Livre');
    expect(marketplaceLabel(null)).toBe('Compartilhado');
  });
});
