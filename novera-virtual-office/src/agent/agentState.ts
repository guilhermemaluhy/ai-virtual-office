/**
 * Vocabulário do agente: estados visuais, rótulos e perfil. Puro, sem React nem Three.js.
 * Nesta versão os estados são controlados localmente (simulação) para validar a interface.
 */
export const AGENT_STATUSES = [
  'idle',
  'working',
  'thinking',
  'executing',
  'done',
  'error',
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: 'Ocioso',
  working: 'Trabalhando',
  thinking: 'Pensando',
  executing: 'Executando tarefa',
  done: 'Concluído',
  error: 'Erro',
};

export const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: '#9aa3b2',
  working: '#5fa8d3',
  thinking: '#e0b354',
  executing: '#8b7cf6',
  done: '#4cc38a',
  error: '#e5675f',
};

export interface AgentProfile {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}

export const FIRST_AGENT: AgentProfile = {
  id: 'nova',
  name: 'Nova',
  role: 'Assistente de Operações',
};

export function isAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === 'string' && (AGENT_STATUSES as readonly string[]).includes(value);
}

/** Estados em que o agente está ocupado (indicador de processamento ligado). */
export function isBusy(status: AgentStatus): boolean {
  return status === 'working' || status === 'thinking' || status === 'executing';
}

/** Sequência do ciclo de demonstração; `error` fica fora e volta para `idle`. */
export const DEMO_SEQUENCE: readonly AgentStatus[] = [
  'idle',
  'thinking',
  'working',
  'executing',
  'done',
];

export function nextDemoStatus(status: AgentStatus): AgentStatus {
  const index = DEMO_SEQUENCE.indexOf(status);
  if (index < 0) return 'idle';
  return DEMO_SEQUENCE[(index + 1) % DEMO_SEQUENCE.length] ?? 'idle';
}
