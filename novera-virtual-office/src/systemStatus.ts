/** Estado técnico do sistema exibido na barra superior (não é o estado do agente). */
export type SystemStatus = 'loading' | 'ready' | 'error' | 'unsupported';

export const SYSTEM_STATUS_LABEL: Record<SystemStatus, string> = {
  loading: 'Carregando cena',
  ready: 'Cena pronta · modo local',
  error: 'Falha na renderização',
  unsupported: 'WebGL indisponível',
};
