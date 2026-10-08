'use client';

import dynamic from 'next/dynamic';
import { useState, useSyncExternalStore } from 'react';
import { useOfficeData } from '../hooks/useOfficeData';
import { api } from '../lib/api';
import { marketplaceLabel, STATE_LABELS } from '../lib/format';
import { ROLE_ICONS } from '../lib/office/theme';
import { AgentPanel } from './AgentPanel';
import { ApprovalsPanel } from './ApprovalsPanel';
import { Hud } from './Hud';

const OfficeScene = dynamic(() => import('./office/OfficeScene').then((m) => m.OfficeScene), {
  ssr: false,
  loading: () => <div className="scene-loading">Montando o escritório…</div>,
});

let webGlSupport: boolean | undefined;

function hasWebGl(): boolean {
  if (webGlSupport === undefined) {
    try {
      const canvas = document.createElement('canvas');
      webGlSupport = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      webGlSupport = false;
    }
  }
  return webGlSupport;
}

const noopSubscribe = () => () => undefined;

export function OfficeApp() {
  const { agents, approvals, summary, currentTasks, error, loading, refresh } = useOfficeData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  // `null` while server-rendering; resolved on the client.
  const webGl = useSyncExternalStore<boolean | null>(noopSubscribe, hasWebGl, () => null);

  const selected = agents.find((a) => a.id === selectedId);
  const manager = selected?.reportsTo ? agents.find((a) => a.id === selected.reportsTo) : undefined;

  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  const runCycle = api.runCycle;
  const triggerCycle = async () => {
    if (!runCycle) return;
    setCycleStatus('Agentes trabalhando…');
    try {
      const summary = await runCycle();
      await refresh();
      setCycleStatus(
        summary.tasksCreated + summary.approvalsRequested + summary.actionsExecuted === 0
          ? 'Ciclo concluído: nada novo.'
          : `Ciclo concluído: ${String(summary.tasksCreated)} tarefas e ${String(summary.approvalsRequested)} pedidos novos.`,
      );
    } catch (cause) {
      setCycleStatus(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const openApprovals = () => {
    setSelectedId(null);
    setApprovalsOpen(true);
  };
  const selectAgent = (id: string | null) => {
    setApprovalsOpen(false);
    setSelectedId(id);
  };

  return (
    <div className="office">
      <Hud summary={summary} onOpenApprovals={openApprovals} />
      {error && (
        <div className="banner" role="alert">
          Não foi possível falar com a API ({error}). Tentando de novo…
        </div>
      )}

      <main className="office__stage">
        {webGl === false ? (
          <ul className="fallback">
            {agents.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => {
                    selectAgent(agent.id);
                  }}
                >
                  {ROLE_ICONS[agent.role]} {agent.name} — {agent.title} (
                  {marketplaceLabel(agent.marketplace)}) · {STATE_LABELS[agent.state]}
                </button>
              </li>
            ))}
          </ul>
        ) : webGl && !loading && agents.length > 0 ? (
          <OfficeScene
            agents={agents}
            currentTasks={currentTasks}
            pendingApprovals={approvals.length}
            selectedAgentId={selectedId}
            onSelectAgent={selectAgent}
            onOpenApprovals={openApprovals}
          />
        ) : (
          <div className="scene-loading">
            {loading ? 'Carregando a equipe…' : 'Nenhum agente cadastrado.'}
          </div>
        )}

        {runCycle && (
          <div className="cycle">
            <button
              type="button"
              className="button button--primary"
              onClick={() => void triggerCycle()}
            >
              ▶ Rodar ciclo dos agentes
            </button>
            {cycleStatus && (
              <span className="cycle__status" role="status">
                {cycleStatus}
              </span>
            )}
          </div>
        )}

        <div className="legend" aria-hidden>
          <span>
            <i className="dot dot--working" /> Trabalhando
          </span>
          <span>
            <i className="dot dot--awaiting" /> Aguardando você
          </span>
          <span>
            <i className="dot dot--idle" /> Disponível
          </span>
          <span className="legend__hint">
            Clique num agente para ver detalhes · arraste para girar · botão direito para mover ·
            role para zoom
          </span>
        </div>
      </main>

      {selected && (
        <AgentPanel
          agent={selected}
          approvals={approvals}
          manager={manager}
          onClose={() => {
            setSelectedId(null);
          }}
          onOpenApprovals={openApprovals}
        />
      )}
      {approvalsOpen && (
        <ApprovalsPanel
          approvals={approvals}
          agents={agents}
          onClose={() => {
            setApprovalsOpen(false);
          }}
          onDecided={() => void refresh()}
        />
      )}
    </div>
  );
}
