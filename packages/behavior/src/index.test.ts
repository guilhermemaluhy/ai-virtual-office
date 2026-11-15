import { describe, expect, it } from 'vitest';
import { isEmployeeState, stateForActivity } from './index.js';

describe('isEmployeeState', () => {
  it('accepts known states and rejects others', () => {
    expect(isEmployeeState('idle')).toBe(true);
    expect(isEmployeeState('awaiting_approval')).toBe(true);
    expect(isEmployeeState('sleeping')).toBe(false);
  });
});

describe('stateForActivity', () => {
  it('shows working only with a real running task', () => {
    expect(stateForActivity({ paused: false, runningTask: true, pendingApproval: false })).toBe(
      'working',
    );
    expect(stateForActivity({ paused: false, runningTask: false, pendingApproval: true })).toBe(
      'awaiting_approval',
    );
    expect(stateForActivity({ paused: false, runningTask: false, pendingApproval: false })).toBe(
      'idle',
    );
  });

  it('the stop switch sends everyone offline', () => {
    expect(stateForActivity({ paused: true, runningTask: true, pendingApproval: true })).toBe(
      'offline',
    );
  });
});
