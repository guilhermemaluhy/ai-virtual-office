import type { AgentDetailDto, AgentDto, ApprovalDto, DashboardSummaryDto, TaskDto } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new Error(`API ${init?.method ?? 'GET'} ${path} falhou (${String(response.status)})`);
  }
  return (await response.json()) as T;
}

export const api = {
  agents: () => request<AgentDto[]>('/agents'),
  agent: (id: string) => request<AgentDetailDto>(`/agents/${encodeURIComponent(id)}`),
  summary: () => request<DashboardSummaryDto>('/dashboard/summary'),
  pendingApprovals: () => request<ApprovalDto[]>('/approvals?status=pending'),
  activeTasks: () => request<TaskDto[]>('/tasks?status=in_progress'),
  decide: (id: string, decision: 'approved' | 'rejected', note?: string) =>
    request<ApprovalDto>(`/approvals/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify(note ? { decision, note } : { decision }),
    }),
};
