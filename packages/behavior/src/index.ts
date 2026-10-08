export const AGENT_STATES = ['idle', 'working', 'meeting', 'break', 'offline'] as const;

export type AgentState = (typeof AGENT_STATES)[number];

export function isAgentState(value: string): value is AgentState {
  return (AGENT_STATES as readonly string[]).includes(value);
}
