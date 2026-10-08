import { describe, expect, it } from 'vitest';
import { colorsFor, MARKETPLACE_COLORS, pickFor, SHARED_COLORS } from './theme';

describe('theme', () => {
  it('picks deterministically', () => {
    const options = ['a', 'b', 'c'] as const;
    expect(pickFor('ml-ads', options)).toBe(pickFor('ml-ads', options));
    expect(() => pickFor('x', [])).toThrow();
  });

  it('colors agents by marketplace', () => {
    expect(colorsFor('shopee')).toBe(MARKETPLACE_COLORS.shopee);
    expect(colorsFor(null)).toBe(SHARED_COLORS);
  });
});
