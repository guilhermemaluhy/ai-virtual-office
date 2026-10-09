import { useThree } from '@react-three/fiber';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createOfficeMaterials, type OfficeMaterials } from './materials.js';

const MaterialsContext = createContext<OfficeMaterials | null>(null);

/** Cria os materiais uma única vez por Canvas e os libera ao desmontar. */
export function MaterialsProvider({ children }: { readonly children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const materials = useMemo(
    () => createOfficeMaterials(Math.min(8, gl.capabilities.getMaxAnisotropy())),
    [gl],
  );
  useEffect(() => () => materials.dispose(), [materials]);
  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useMaterials(): OfficeMaterials {
  const materials = useContext(MaterialsContext);
  if (!materials) throw new Error('useMaterials precisa estar dentro de <MaterialsProvider>');
  return materials;
}
