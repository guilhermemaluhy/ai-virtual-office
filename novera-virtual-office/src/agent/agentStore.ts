import { createStore, useStore } from '../lib/store.js';
import { FIRST_AGENT, type AgentProfile, type AgentStatus } from './agentState.js';

export interface AgentState {
  readonly profile: AgentProfile;
  readonly status: AgentStatus;
  /** Instante (ms, `performance.now()`) da última mudança de estado: anima acenos e balanços. */
  readonly statusChangedAt: number;
  readonly selected: boolean;
}

const initialState: AgentState = {
  profile: FIRST_AGENT,
  status: 'idle',
  statusChangedAt: 0,
  selected: false,
};

export const agentStore = createStore<AgentState>(initialState);

export function setAgentStatus(status: AgentStatus, now: number = performance.now()): void {
  agentStore.set((state) =>
    state.status === status ? state : { ...state, status, statusChangedAt: now },
  );
}

export function setAgentSelected(selected: boolean): void {
  agentStore.set((state) => (state.selected === selected ? state : { ...state, selected }));
}

export function toggleAgentSelected(): void {
  agentStore.set((state) => ({ ...state, selected: !state.selected }));
}

export function resetAgentStore(): void {
  agentStore.set(initialState);
}

export function useAgentState<S>(selector: (state: AgentState) => S): S {
  return useStore(agentStore, selector);
}
