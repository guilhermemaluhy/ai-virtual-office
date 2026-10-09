import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';

/** Gaveteiro volante com três gavetas. Frente em +Z. */
export function Pedestal() {
  const m = useMaterials();
  return (
    <group name="pedestal">
      <RoundedBox
        args={[0.42, 0.56, 0.55]}
        radius={0.008}
        smoothness={2}
        position={[0, 0.32, 0]}
        material={m.trim}
        castShadow
        receiveShadow
      />
      {[0.15, 0.32, 0.49].map((y) => (
        <group key={y} position={[0, y, 0.28]}>
          <RoundedBox
            args={[0.39, 0.15, 0.012]}
            radius={0.004}
            smoothness={2}
            material={m.trim}
            castShadow
          />
          <mesh position={[0, 0.045, 0.012]} material={m.chrome}>
            <boxGeometry args={[0.14, 0.012, 0.012]} />
          </mesh>
        </group>
      ))}
      {[-0.16, 0.16].flatMap((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 0.025, z]} material={m.blackPlastic}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
          </mesh>
        )),
      )}
    </group>
  );
}
