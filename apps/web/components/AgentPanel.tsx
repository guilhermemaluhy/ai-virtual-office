'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { marketplaceLabel, STATE_LABELS } from '../lib/format';
import { ROLE_ICONS } from '../lib/office/theme';
import type { AgentDetailDto, AgentDto, ApprovalDto } from '../lib/types';

const TASK_STATUS: Record<string, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluída',
};

export function AgentPanel({
  agent,
  approvals,
  manager,
  onClose,
  onOpenApprovals,
}: {
  agent: AgentDto;
  approvals: ApprovalDto[];
  manager: AgentDto | undefined;
  onClose: () => void;
  onOpenApprovals: () => void;
}) {
  const [detail, setDetail] = useState<AgentDetailDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .agent(agent.id)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [agent.id, agent.state]);

  const mine = approvals.filter((a) => a.requestedBy === agent.id);

  return (
    <aside className="panel" aria-label={`Detalhes de ${agent.name}`}>
      <button type="button" className="panel__close" onClick={onClose} aria-label="Fechar">
        ×
      </button>
      <div className="panel__header">
        <div className="panel__avatar">{ROLE_ICONS[agent.role]}</div>
        <div>
          <h2>{agent.name}</h2>
          <div className="panel__muted">{agent.title}</div>
        </div>
      </div>
      <dl className="panel__facts">
        <dt>Status</dt>
        <dd>
          <span className={`state state--${agent.state}`}>{STATE_LABELS[agent.state]}</span>
        </dd>
        <dt>Marketplace</dt>
        <dd>{marketplaceLabel(agent.marketplace)}</dd>
        <dt>Responde a</dt>
        <dd>{manager ? `${manager.name} (${manager.title})` : 'CEO (você)'}</dd>
      </dl>

      {mine.length > 0 && (
        <section>
          <h3>Esperando sua aprovação</h3>
          <ul className="list">
            {mine.map((approval) => (
              <li key={approval.id}>{approval.summary}</li>
            ))}
          </ul>
          <button type="button" className="button button--primary" onClick={onOpenApprovals}>
            Ver aprovações
          </button>
        </section>
      )}

      <section>
        <h3>Tarefas</h3>
        {detail === null ? (
          <p className="panel__muted">Carregando…</p>
        ) : detail.tasks.length === 0 ? (
          <p className="panel__muted">Nenhuma tarefa no momento.</p>
        ) : (
          <ul className="list">
            {detail.tasks.map((task) => (
              <li key={task.id}>
                {task.title}
                <span className="panel__muted"> · {TASK_STATUS[task.status] ?? task.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
