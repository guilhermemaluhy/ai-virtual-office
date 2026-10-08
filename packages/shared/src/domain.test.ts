import { describe, expect, it } from 'vitest';
import { riskRank } from './index.js';

describe('riskRank', () => {
  it('orders risk levels', () => {
    expect(riskRank('read')).toBeLessThan(riskRank('low'));
    expect(riskRank('medium')).toBeLessThan(riskRank('high'));
  });
});
