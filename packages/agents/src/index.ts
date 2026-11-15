import type { LlmProvider } from '@aivo/ai';
import type { ToolRegistry } from '@aivo/tools';

export {
  canPromote,
  EMPLOYEES,
  employeesByPhase,
  getEmployeeDefinition,
  type EmployeeDefinition,
} from './employees.js';

/** What an employee receives when it runs (Fase 4). */
export interface EmployeeContext {
  llm: LlmProvider;
  tools: ToolRegistry;
}
