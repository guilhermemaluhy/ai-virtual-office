import { describe, expect, it } from 'vitest';
import {
  AUTONOMY_LEVELS,
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLES,
  MICRO_USD_PER_USD,
  riskRank,
} from './index.js';

describe('domain vocabulary', () => {
  it('orders risk levels', () => {
    expect(riskRank('read')).toBeLessThan(riskRank('low'));
    expect(riskRank('medium')).toBeLessThan(riskRank('high'));
  });

  it('has a label for each of the six employee roles', () => {
    expect(EMPLOYEE_ROLES).toHaveLength(6);
    for (const role of EMPLOYEE_ROLES) expect(EMPLOYEE_ROLE_LABELS[role]).toBeTruthy();
  });

  it('autonomy climbs from simulation to autonomous', () => {
    expect(AUTONOMY_LEVELS).toEqual(['simulacao', 'aprovacao', 'autonomo']);
  });

  it('stores AI cost in micro-dollars', () => {
    expect(0.0123 * MICRO_USD_PER_USD).toBeCloseTo(12_300);
  });
});
