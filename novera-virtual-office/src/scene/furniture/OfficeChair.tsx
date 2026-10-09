import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';

const SEAT_HEIGHT = 0.47;

/** Cadeira ergonômica: base em estrela com rodízios, pistão, assento, encosto e apoios. Olha para +Z. */
export function OfficeChair() {
  const m = useMaterials();
  const spokes = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2);

  return (
    <group name="office-chair">
      {spokes.map((angle) => (
        <group key={angle} rotation-y={angle}>
          <mesh position={[0, 0.045, 0.15]} rotation-x={0.12} material={m.darkMetal} castShadow>
            <boxGeometry args={[0.04, 0.03, 0.3]} />
          </mesh>
          <mesh position={[0, 0.03, 0.29]} material={m.blackPlastic} castShadow>
            <sphereGeometry args={[0.03, 12, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.07, 0]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.06, 20]} />
      </mesh>
      <mesh position={[0, 0.26, 0]} material={m.chrome} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.34, 16]} />
      </mesh>
      <mesh position={[0, SEAT_HEIGHT - 0.06, 0]} material={m.blackPlastic} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
      </mesh>
      <RoundedBox
        args={[0.5, 0.085, 0.5]}
        radius={0.03}
        smoothness={3}
        position={[0, SEAT_HEIGHT, 0.02]}
        material={m.fabricDark}
        castShadow
        receiveShadow
      />
      {/* coluna do encosto e encosto */}
      <mesh
        position={[0, SEAT_HEIGHT + 0.12, -0.24]}
        rotation-x={-0.12}
        material={m.darkMetal}
        castShadow
      >
        <boxGeometry args={[0.08, 0.3, 0.03]} />
      </mesh>
      <group position={[0, SEAT_HEIGHT + 0.36, -0.25]} rotation-x={-0.14}>
        <RoundedBox
          args={[0.46, 0.56, 0.07]}
          radius={0.03}
          smoothness={3}
          material={m.fabricDark}
          castShadow
          receiveShadow
        />
        <RoundedBox
          args={[0.34, 0.1, 0.03]}
          radius={0.012}
          smoothness={2}
          position={[0, -0.15, 0.045]}
          material={m.fabricDark}
        />
        <RoundedBox
          args={[0.24, 0.12, 0.06]}
          radius={0.02}
          smoothness={2}
          position={[0, 0.38, 0.0]}
          material={m.fabricDark}
          castShadow
        />
        <mesh position={[0, 0.3, -0.01]} material={m.darkMetal}>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
        </mesh>
      </group>
      {/* apoios de braço */}
      {[-0.27, 0.27].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, SEAT_HEIGHT + 0.1, 0.02]} material={m.darkMetal} castShadow>
            <boxGeometry args={[0.03, 0.2, 0.05]} />
          </mesh>
          <RoundedBox
            args={[0.07, 0.03, 0.26]}
            radius={0.01}
            smoothness={2}
            position={[0, SEAT_HEIGHT + 0.21, 0.04]}
            material={m.blackPlastic}
            castShadow
          />
        </group>
      ))}
    </group>
  );
}
