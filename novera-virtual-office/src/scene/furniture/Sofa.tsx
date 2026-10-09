import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';

/** Sofá de dois lugares com almofadas. Frente em +Z. */
export function Sofa() {
  const m = useMaterials();
  return (
    <group name="sofa">
      <RoundedBox
        args={[1.56, 0.3, 0.85]}
        radius={0.03}
        smoothness={3}
        position={[0, 0.25, 0]}
        material={m.fabricAccent}
        castShadow
        receiveShadow
      />
      {[-0.39, 0.39].map((x) => (
        <RoundedBox
          key={`seat-${x}`}
          args={[0.74, 0.14, 0.7]}
          radius={0.04}
          smoothness={3}
          position={[x, 0.46, 0.05]}
          material={m.fabricAccent}
          castShadow
          receiveShadow
        />
      ))}
      {[-0.39, 0.39].map((x) => (
        <RoundedBox
          key={`back-${x}`}
          args={[0.74, 0.46, 0.17]}
          radius={0.04}
          smoothness={3}
          position={[x, 0.66, -0.33]}
          rotation-x={-0.12}
          material={m.fabricAccent}
          castShadow
          receiveShadow
        />
      ))}
      {[-0.84, 0.84].map((x) => (
        <RoundedBox
          key={`arm-${x}`}
          args={[0.12, 0.58, 0.85]}
          radius={0.03}
          smoothness={3}
          position={[x, 0.39, 0]}
          material={m.fabricAccent}
          castShadow
          receiveShadow
        />
      ))}
      <RoundedBox
        args={[0.4, 0.4, 0.12]}
        radius={0.04}
        smoothness={3}
        position={[-0.5, 0.72, -0.17]}
        rotation={[-0.2, 0.3, 0.1]}
        material={m.cushion}
        castShadow
      />
      {[-0.7, 0.7].flatMap((x) =>
        [-0.32, 0.32].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 0.05, z]} material={m.darkMetal} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 10]} />
          </mesh>
        )),
      )}
    </group>
  );
}
