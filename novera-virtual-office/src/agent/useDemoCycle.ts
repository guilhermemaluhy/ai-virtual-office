import { useEffect } from 'react';
import { nextDemoStatus } from './agentState.js';
import { agentStore, setAgentStatus } from './agentStore.js';

/** Avança o estado do agente automaticamente (simulação para validar a interface). */
export function useDemoCycle(enabled: boolean, intervalMs = 4000): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(
      () => setAgentStatus(nextDemoStatus(agentStore.get().status)),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
