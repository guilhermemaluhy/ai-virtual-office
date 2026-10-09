import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';

/** Porta de nogueira com guarnição branca e maçaneta. Frente em +Z, apoiada no piso. */
export function Door() {
  const m = useMaterials();
  return (
    <group name="door">
      <RoundedBox
        args={[0.9, 2.1, 0.045]}
        radius={0.004}
        smoothness={2}
        position={[0, 1.05, 0]}
        material={m.walnut}
        castShadow
        receiveShadow
      />
      <mesh position={[-0.5, 1.1, 0]} material={m.trim} castShadow>
        <boxGeometry args={[0.08, 2.2, 0.06]} />
      </mesh>
      <mesh position={[0.5, 1.1, 0]} material={m.trim} castShadow>
        <boxGeometry args={[0.08, 2.2, 0.06]} />
      </mesh>
      <mesh position={[0, 2.16, 0]} material={m.trim} castShadow>
        <boxGeometry args={[1.08, 0.08, 0.06]} />
      </mesh>
      <mesh position={[0.35, 1.02, 0.04]} rotation-z={Math.PI / 2} material={m.chrome} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.12, 12]} />
      </mesh>
      <mesh position={[0.4, 1.02, 0.025]} rotation-x={Math.PI / 2} material={m.chrome}>
        <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
      </mesh>
    </group>
  );
}
