import type { LlmProvider } from '@aivo/ai';
import type { ToolRegistry } from '@aivo/tools';

export {
  agentId,
  chainOfCommand,
  directReports,
  getAgentDefinition,
  ORG_CHART,
  ROLE_LABELS,
  type AgentDefinition,
} from './org-chart.js';

export interface AgentContext {
  llm: LlmProvider;
  tools: ToolRegistry;
}
