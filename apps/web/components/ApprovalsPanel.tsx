'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { ROLE_ICONS } from '../lib/office/theme';
import type { AgentDto, ApprovalDto } from '../lib/types';

const RISK_LABELS: Record<string, string> = {
  read: 'Leitura',
  low: 'Risco baixo',
  medium: 'Risco médio',
  high: 'Risco alto',
};

export function ApprovalsPanel({
  approvals,
  agents,
  onClose,
  onDecided,
}: {
  approvals: ApprovalDto[];
  agents: AgentDto[];
  onClose: () => void;
  onDecided: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    setBusy(id);
    setError(null);
    try {
      await api.decide(id, decision);
      onDecided();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <aside className="panel panel--wide" aria-label="Aprovações pendentes">
      <button type="button" className="panel__close" onClick={onClose} aria-label="Fechar">
        ×
      </button>
      <h2>Aprovações pendentes</h2>
      <p className="panel__muted">Nada muda nas suas contas sem a sua decisão.</p>
      {error && <p className="panel__error">{error}</p>}
      {approvals.length === 0 ? (
        <p className="panel__muted">Tudo em dia. 🎉</p>
      ) : (
        <ul className="approvals">
          {approvals.map((approval) => {
            const agent = agents.find((a) => a.id === approval.requestedBy);
            return (
              <li key={approval.id} className="approval">
                <div className="approval__who">
                  {agent
                    ? `${ROLE_ICONS[agent.role]} ${agent.name} · ${agent.title}`
                    : approval.requestedBy}
                </div>
                <div className="approval__summary">{approval.summary}</div>
                <div className="approval__footer">
                  <span className={`risk risk--${approval.risk}`}>
                    {RISK_LABELS[approval.risk]}
                  </span>
                  <div className="approval__actions">
                    <button
                      type="button"
                      className="button"
                      disabled={busy !== null}
                      onClick={() => void decide(approval.id, 'rejected')}
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={busy !== null}
                      onClick={() => void decide(approval.id, 'approved')}
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
