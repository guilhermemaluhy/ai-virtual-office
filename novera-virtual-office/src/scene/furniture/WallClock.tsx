import { useMaterials } from '../materials/MaterialsProvider.js';

/** Relógio de parede parado em 10:10 (sem animação nesta etapa). Frente em +Z. */
export function WallClock() {
  const m = useMaterials();
  return (
    <group name="wall-clock" rotation-x={Math.PI / 2}>
      <mesh material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 40]} />
      </mesh>
      <mesh position={[0, 0.017, 0]} material={m.paper}>
        <cylinderGeometry args={[0.145, 0.145, 0.004, 40]} />
      </mesh>
      {[...Array(12).keys()].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 12) * Math.PI * 2) * 0.125,
            -0.02,
            -Math.cos((i / 12) * Math.PI * 2) * 0.125,
          ]}
          material={m.blackPlastic}
        >
          <boxGeometry args={[0.006, 0.002, i % 3 === 0 ? 0.02 : 0.01]} />
        </mesh>
      ))}
      <mesh position={[0.03, 0.021, -0.03]} rotation-y={-Math.PI / 4} material={m.blackPlastic}>
        <boxGeometry args={[0.006, 0.002, 0.09]} />
      </mesh>
      <mesh position={[-0.04, 0.022, -0.04]} rotation-y={Math.PI / 4} material={m.blackPlastic}>
        <boxGeometry args={[0.005, 0.002, 0.12]} />
      </mesh>
    </group>
  );
}
