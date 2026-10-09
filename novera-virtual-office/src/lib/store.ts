import { useSyncExternalStore } from 'react';

/** Store mínimo e síncrono, sem dependências: estado imutável + assinantes. */
export interface Store<T> {
  get(): T;
  set(update: T | ((previous: T) => T)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(update) {
      const next = typeof update === 'function' ? (update as (previous: T) => T)(state) : update;
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Hook de leitura. O seletor deve devolver primitivos ou referências estáveis. */
export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  );
}
