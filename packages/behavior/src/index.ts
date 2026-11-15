import { EMPLOYEE_STATES, type EmployeeState } from '@aivo/shared';

export { EMPLOYEE_STATES, type EmployeeState };

export function isEmployeeState(value: string): value is EmployeeState {
  return (EMPLOYEE_STATES as readonly string[]).includes(value);
}

/** `working` only exists while a real task runs (rule 11). */
export function stateForActivity(input: {
  paused: boolean;
  runningTask: boolean;
  pendingApproval: boolean;
}): EmployeeState {
  if (input.paused) return 'offline';
  if (input.runningTask) return 'working';
  if (input.pendingApproval) return 'awaiting_approval';
  return 'idle';
}
