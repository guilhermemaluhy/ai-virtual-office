import { describe, expect, it } from 'vitest';
import { ToolRegistry, type ToolDefinition } from './registry.js';

const echo: ToolDefinition = {
  name: 'echo',
  description: 'Returns its input',
  execute: (input) => Promise.resolve(input),
};

describe('ToolRegistry', () => {
  it('registers and retrieves tools', () => {
    const registry = new ToolRegistry();
    registry.register(echo);
    expect(registry.get('echo')).toBe(echo);
    expect(registry.list()).toEqual([echo]);
  });

  it('rejects duplicate names', () => {
    const registry = new ToolRegistry();
    registry.register(echo);
    expect(() => {
      registry.register(echo);
    }).toThrow(/already registered/);
  });
});
