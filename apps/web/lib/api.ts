import snapshot from '../demo/snapshot.json';
import { createDemoApi, type DemoSnapshot } from './demo-api';
import type {
  AgentDetailDto,
  AgentDto,
  ApprovalDto,
  ChatReplyDto,
  ChatTurnDto,
  CycleSummaryDto,
  DashboardSummaryDto,
  TaskDto,
} from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** `NEXT_PUBLIC_DEMO=1` builds a server-less demo backed by `demo/snapshot.json`. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === '1';

export interface OfficeApi {
  agents(): Promise<AgentDto[]>;
  agent(id: string): Promise<AgentDetailDto>;
  summary(): Promise<DashboardSummaryDto>;
  pendingApprovals(): Promise<ApprovalDto[]>;
  activeTasks(): Promise<TaskDto[]>;
  decide(id: string, decision: 'approved' | 'rejected', note?: string): Promise<ApprovalDto>;
  chat(agentId: string, messages: ChatTurnDto[]): Promise<ChatReplyDto>;
  /** `null` when the agents' work cycle cannot be triggered from here (demo). */
  runCycle: (() => Promise<CycleSummaryDto>) | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  // Fastify rejects a JSON content-type with an empty body.
  if (init?.body) headers.set('content-type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(
      body?.message ?? `API ${init?.method ?? 'GET'} ${path} falhou (${String(response.status)})`,
    );
  }
  return (await response.json()) as T;
}

const httpApi: OfficeApi = {
  agents: () => request('/agents'),
  agent: (id) => request(`/agents/${encodeURIComponent(id)}`),
  summary: () => request('/dashboard/summary'),
  pendingApprovals: () => request('/approvals?status=pending'),
  activeTasks: () => request('/tasks?status=in_progress'),
  decide: (id, decision, note) =>
    request(`/approvals/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify(note ? { decision, note } : { decision }),
    }),
  chat: (agentId, messages) =>
    request(`/agents/${encodeURIComponent(agentId)}/chat`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
  runCycle: () => request('/cycle/run', { method: 'POST' }),
};

export const api: OfficeApi = DEMO_MODE ? createDemoApi(snapshot as DemoSnapshot) : httpApi;
