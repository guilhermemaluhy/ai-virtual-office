import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Object3D } from 'three';

interface ColliderRegistry {
  /** Lista mutável compartilhada com o controle de câmera (ele lê a referência a cada quadro). */
  readonly list: Object3D[];
  register(object: Object3D): () => void;
}

const CollidersContext = createContext<ColliderRegistry | null>(null);

export function CameraCollidersProvider({ children }: { readonly children: ReactNode }) {
  const registry = useMemo<ColliderRegistry>(() => {
    const list: Object3D[] = [];
    return {
      list,
      register(object) {
        list.push(object);
        return () => {
          const index = list.indexOf(object);
          if (index >= 0) list.splice(index, 1);
        };
      },
    };
  }, []);
  return <CollidersContext.Provider value={registry}>{children}</CollidersContext.Provider>;
}

export function useColliderRegistry(): ColliderRegistry | null {
  return useContext(CollidersContext);
}

/** Ref de callback: registra o objeto como obstáculo para a câmera enquanto estiver montado. */
export function useCameraCollider(
  enabled: boolean,
): (object: Object3D | null) => void | (() => void) {
  const registry = useContext(CollidersContext);
  return useCallback(
    (object: Object3D | null) => {
      if (!enabled || !registry || !object) return undefined;
      return registry.register(object);
    },
    [enabled, registry],
  );
}
