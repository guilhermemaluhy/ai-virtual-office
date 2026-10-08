import type { LlmProvider } from '@aivo/ai';
import type { AgentState } from '@aivo/behavior';
import type { ToolRegistry } from '@aivo/tools';

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
}

export interface AgentContext {
  llm: LlmProvider;
  tools: ToolRegistry;
}

export interface Agent {
  readonly profile: AgentProfile;
  readonly state: AgentState;
}

export function createAgent(profile: AgentProfile, state: AgentState = 'idle'): Agent {
  return { profile, state };
}
