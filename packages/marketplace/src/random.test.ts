import { describe, expect, it } from 'vitest';
import { Random } from './index.js';

describe('Random', () => {
  it('is reproducible and bounded', () => {
    const a = new Random(1);
    const b = new Random(1);
    for (let i = 0; i < 100; i++) {
      const value = a.int(3, 9);
      expect(value).toBe(b.int(3, 9));
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(9);
    }
  });

  it('refuses to pick from an empty list', () => {
    expect(() => new Random(1).pick([])).toThrow();
  });
});
