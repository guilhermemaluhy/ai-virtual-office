import type { Vec3 } from '../../lib/math.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

export function Mouse({ position }: { readonly position: Vec3 }) {
  const m = useMaterials();
  return (
    <group name="mouse" position={position}>
      <mesh position={[0, 0.02, 0]} scale={[0.6, 0.36, 1.05]} material={m.blackPlastic} castShadow>
        <sphereGeometry args={[0.058, 20, 14]} />
      </mesh>
      <mesh position={[0, 0.038, -0.02]} material={m.greyPlastic}>
        <boxGeometry args={[0.004, 0.006, 0.02]} />
      </mesh>
    </group>
  );
}
