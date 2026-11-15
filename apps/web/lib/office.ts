import type { AutonomyLevel, EmployeeRole, EmployeeState } from '@aivo/shared';

/** Rows the dashboard reads from Supabase (snake_case as stored). */
export interface OfficeSettingsRow {
  paused: boolean;
  paused_at: string | null;
  pause_reason: string | null;
}

export interface EmployeeListRow {
  id: string;
  name: string;
  title: string;
  role: EmployeeRole;
  model: string;
  state: EmployeeState;
  autonomy: AutonomyLevel;
  active: boolean;
  hired_at: string;
}

export interface OwnerRow {
  user_id: string;
  name: string | null;
}
