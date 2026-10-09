import { describe, expect, it } from 'vitest';
import { createRandom } from '../../lib/math.js';
import { generatePlankLayout } from './painters.js';

describe('createRandom', () => {
  it('é determinístico e fica em [0, 1)', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    for (let i = 0; i < 50; i += 1) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(createRandom(1)()).not.toBe(createRandom(2)());
  });
});

describe('generatePlankLayout', () => {
  const layout = generatePlankLayout(createRandom(7), 15, 1024);

  it('cada fileira tem tábuas que somam exatamente a largura da textura (repete sem emenda)', () => {
    for (let row = 0; row < layout.rows; row += 1) {
      const total = layout.planks
        .filter((p) => p.row === row)
        .reduce((sum, p) => sum + p.length, 0);
      expect(total).toBeCloseTo(layout.size, 6);
    }
  });

  it('as juntas não ficam alinhadas entre fileiras', () => {
    const starts = new Set(layout.planks.map((p) => Math.round(p.x0)));
    expect(starts.size).toBeGreaterThan(layout.rows);
  });

  it('os inícios ficam dentro da textura', () => {
    for (const plank of layout.planks) {
      expect(plank.x0).toBeGreaterThanOrEqual(0);
      expect(plank.x0).toBeLessThan(layout.size);
      expect(plank.tone).toBeGreaterThanOrEqual(0);
      expect(plank.tone).toBeLessThanOrEqual(1);
    }
  });
});
