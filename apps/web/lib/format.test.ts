import { describe, expect, it } from 'vitest';
import { brl, dateTime, integer, usdFromMicro } from './format';

describe('format', () => {
  it('formats money and numbers in pt-BR', () => {
    expect(brl(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
    expect(integer(2529)).toBe('2.529');
    expect(usdFromMicro(1_250_000).replace(/\s/g, ' ')).toBe('US$ 1,25');
  });

  it('shows dates in Brasília time', () => {
    expect(dateTime('2026-11-15T15:30:00Z')).toBe('15/11/2026, 12:30');
  });
});
