import { EMPLOYEE_ROLES } from '@aivo/shared';
import { describe, expect, it } from 'vitest';
import { canPromote, EMPLOYEES, employeesByPhase, getEmployeeDefinition } from './index.js';

describe('EMPLOYEES', () => {
  it('defines exactly one employee per role', () => {
    expect(EMPLOYEES.map((e) => e.role).sort()).toEqual([...EMPLOYEE_ROLES].sort());
    expect(new Set(EMPLOYEES.map((e) => e.id)).size).toBe(EMPLOYEES.length);
  });

  it('starts with the stock analyst alone in Fase 4', () => {
    expect(employeesByPhase(4).map((e) => e.id)).toEqual(['analista-estoque']);
    expect(employeesByPhase(12)).toHaveLength(6);
  });

  it('read-only roles never climb above simulation', () => {
    for (const employee of EMPLOYEES) {
      if (!employee.touchesStore) expect(employee.maxAutonomy).toBe('simulacao');
    }
  });

  it('promotes one level at a time, up to the role maximum', () => {
    const preco = getEmployeeDefinition('preco-margem');
    const estoque = getEmployeeDefinition('analista-estoque');
    if (!preco || !estoque) throw new Error('definitions missing');
    expect(canPromote(preco, 'simulacao', 'aprovacao')).toBe(true);
    expect(canPromote(preco, 'simulacao', 'autonomo')).toBe(false);
    expect(canPromote(preco, 'aprovacao', 'autonomo')).toBe(true);
    expect(canPromote(estoque, 'simulacao', 'aprovacao')).toBe(false);
  });
});
