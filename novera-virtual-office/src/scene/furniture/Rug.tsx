import { useMaterials } from '../materials/MaterialsProvider.js';

export function Rug({ size }: { readonly size: readonly [width: number, depth: number] }) {
  const m = useMaterials();
  return (
    <mesh
      name="rug"
      position={[0, 0.006, 0]}
      rotation-x={-Math.PI / 2}
      material={m.rug}
      receiveShadow
    >
      <planeGeometry args={[size[0], size[1]]} />
    </mesh>
  );
}
