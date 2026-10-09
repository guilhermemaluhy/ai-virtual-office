import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createStore, useStore } from './store.js';

describe('createStore', () => {
  it('lê, grava e notifica assinantes', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set({ count: 1 });
    store.set((previous) => ({ count: previous.count + 1 }));
    expect(store.get().count).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.set({ count: 3 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('não notifica quando o estado é o mesmo', () => {
    const state = { count: 0 };
    const store = createStore(state);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(state);
    expect(listener).not.toHaveBeenCalled();
  });

  it('useStore re-renderiza com o valor selecionado', () => {
    const store = createStore({ count: 0, other: 'x' });
    const { result } = renderHook(() => useStore(store, (s) => s.count));
    expect(result.current).toBe(0);
    act(() => store.set({ count: 5, other: 'x' }));
    expect(result.current).toBe(5);
  });
});
