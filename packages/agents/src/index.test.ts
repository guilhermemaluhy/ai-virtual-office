import { describe, expect, it } from 'vitest';
import { createAgent } from './index.js';

describe('createAgent', () => {
  it('starts idle by default', () => {
    const agent = createAgent({ id: 'a1', name: 'Ana', role: 'engineer' });
    expect(agent.state).toBe('idle');
    expect(agent.profile.name).toBe('Ana');
  });
});
