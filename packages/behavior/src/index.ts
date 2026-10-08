import { AGENT_STATES, type AgentState } from '@aivo/shared';

export { AGENT_STATES, type AgentState };

export function isAgentState(value: string): value is AgentState {
  return (AGENT_STATES as readonly string[]).includes(value);
}
