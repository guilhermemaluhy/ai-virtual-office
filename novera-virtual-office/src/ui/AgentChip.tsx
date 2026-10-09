import { Loader2 } from 'lucide-react';
import { isBusy, STATUS_LABEL } from '../agent/agentState.js';
import { toggleAgentSelected, useAgentState } from '../agent/agentStore.js';

/** Identificação do agente na barra superior; clicar seleciona/deseleciona. */
export function AgentChip() {
  const profile = useAgentState((s) => s.profile);
  const status = useAgentState((s) => s.status);
  const selected = useAgentState((s) => s.selected);
  return (
    <button
      type="button"
      className="agent-chip"
      data-status={status}
      aria-pressed={selected}
      onClick={toggleAgentSelected}
      title={selected ? 'Desselecionar agente' : 'Selecionar agente'}
    >
      <span className="agent-chip__dot" aria-hidden="true" />
      <span className="agent-chip__name">{profile.name}</span>
      <span className="agent-chip__role">{profile.role}</span>
      <span className="agent-chip__status">
        {isBusy(status) && <Loader2 size={12} className="spin" aria-hidden="true" />}
        {STATUS_LABEL[status]}
      </span>
    </button>
  );
}
