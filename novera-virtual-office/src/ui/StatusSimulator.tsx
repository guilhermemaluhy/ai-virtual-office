import { FlaskConical } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { AGENT_STATUSES, STATUS_COLOR, STATUS_LABEL } from '../agent/agentState.js';
import { setAgentStatus, useAgentState } from '../agent/agentStore.js';
import { useDemoCycle } from '../agent/useDemoCycle.js';

/**
 * Painel de simulação: troca o estado visual do agente à mão ou em ciclo automático.
 * Existe só para validar a interface — não há inteligência nem tarefa real por trás.
 */
export function StatusSimulator() {
  const status = useAgentState((s) => s.status);
  const [auto, setAuto] = useState(false);
  useDemoCycle(auto);

  return (
    <aside className="simulator" aria-label="Simulação de estado do agente">
      <header className="simulator__header">
        <FlaskConical size={13} aria-hidden="true" />
        <span>Simulação local</span>
        <span className="simulator__badge">sem IA</span>
      </header>
      <div className="simulator__buttons" role="group" aria-label="Estado">
        {AGENT_STATUSES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === status}
            style={{ '--status-color': STATUS_COLOR[item] } as CSSProperties}
            onClick={() => setAgentStatus(item)}
          >
            {STATUS_LABEL[item]}
          </button>
        ))}
      </div>
      <label className="simulator__auto">
        <input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} />
        Ciclo automático (4 s)
      </label>
    </aside>
  );
}
