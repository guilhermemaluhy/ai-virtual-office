import { describe, expect, it } from 'vitest';
import { isAgentState } from './index.js';

describe('isAgentState', () => {
  it('accepts known states and rejects others', () => {
    expect(isAgentState('idle')).toBe(true);
    expect(isAgentState('awaiting_approval')).toBe(true);
    expect(isAgentState('sleeping')).toBe(false);
  });
});
