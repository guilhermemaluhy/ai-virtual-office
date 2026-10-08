import { offlineReply } from '@aivo/agents/chat-text';
import { MARKETPLACE_LABELS } from '@aivo/shared';
import type { AgentDetailDto, AgentDto, ApprovalDto, DashboardSummaryDto, TaskDto } from './types';
import type { OfficeApi } from './api';

export interface DemoSnapshot {
  agents: AgentDto[];
  approvals: ApprovalDto[];
  summary: DashboardSummaryDto;
  tasks: TaskDto[];
}

/**
 * In-memory API over a captured snapshot, for the server-less demo build.
 * Decisions only live in this browser tab.
 */
export function createDemoApi(
  snapshot: DemoSnapshot,
  now: () => Date = () => new Date(),
): OfficeApi {
  const state = structuredClone(snapshot);

  const refreshAgentState = (agentId: string) => {
    const agent = state.agents.find((a) => a.id === agentId);
    if (!agent || agent.state !== 'awaiting_approval') return;
    const stillWaiting = state.approvals.some(
      (a) => a.requestedBy === agentId && a.status === 'pending',
    );
    if (stillWaiting) return;
    const working = state.tasks.some((t) => t.agentId === agentId && t.status === 'in_progress');
    agent.state = working ? 'working' : 'idle';
  };

  const pending = () => state.approvals.filter((a) => a.status === 'pending');

  return {
    agents: () => Promise.resolve(structuredClone(state.agents)),
    agent: (id) => {
      const agent = state.agents.find((a) => a.id === id);
      if (!agent) return Promise.reject(new Error(`Agente ${id} não encontrado`));
      const detail: AgentDetailDto = {
        ...agent,
        tasks: state.tasks.filter((t) => t.agentId === id),
      };
      return Promise.resolve(structuredClone(detail));
    },
    summary: () =>
      Promise.resolve({ ...structuredClone(state.summary), pendingApprovals: pending().length }),
    pendingApprovals: () => Promise.resolve(structuredClone(pending())),
    activeTasks: () => Promise.resolve(state.tasks.filter((t) => t.status === 'in_progress')),
    decide: (id, decision, note) => {
      const approval = state.approvals.find((a) => a.id === id);
      if (!approval) return Promise.reject(new Error('Pedido de aprovação não encontrado'));
      if (approval.status !== 'pending') {
        return Promise.reject(
          new Error(
            `Esse pedido já foi ${approval.status === 'approved' ? 'aprovado' : 'recusado'}`,
          ),
        );
      }
      Object.assign(approval, {
        status: decision,
        decidedBy: 'ceo',
        decisionNote: note ?? null,
        decidedAt: now().toISOString(),
      });
      refreshAgentState(approval.requestedBy);
      return Promise.resolve(structuredClone(approval));
    },
    chat: (agentId) => {
      const agent = state.agents.find((a) => a.id === agentId);
      if (!agent) return Promise.reject(new Error(`Agente ${agentId} não encontrado`));
      const manager = state.agents.find((a) => a.id === agent.reportsTo);
      const metrics = state.summary.marketplaces.find((m) => m.marketplace === agent.marketplace);
      const reply = offlineReply({
        name: agent.name,
        title: agent.title,
        role: agent.role,
        marketplace: agent.marketplace,
        managerName: manager ? `${manager.name} (${manager.title})` : null,
        tasks: state.tasks
          .filter((t) => t.agentId === agentId && t.status !== 'done')
          .map((t) => t.title),
        pendingApprovals: pending()
          .filter((a) => a.requestedBy === agentId)
          .map((a) => a.summary),
        facts: metrics
          ? [
              `${String(metrics.activeListings)} anúncios ativos no ${MARKETPLACE_LABELS[metrics.marketplace]}`,
              `${String(metrics.orders30d)} pedidos nos últimos 30 dias`,
            ]
          : [`${String(state.summary.stock.outOfStock)} produtos sem estoque`],
      });
      return Promise.resolve({ reply, mode: 'offline' as const });
    },
    runCycle: null,
  };
}
