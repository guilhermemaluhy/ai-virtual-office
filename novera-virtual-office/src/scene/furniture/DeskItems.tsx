import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';
import { Plant } from './Plant.js';

/** Caneca, caderno, celular e uma plantinha. Posições relativas ao tampo da mesa. */
export function DeskItems() {
  const m = useMaterials();
  return (
    <group name="desk-items">
      <group position={[0.55, 0, 0.12]}>
        <mesh position={[0, 0.048, 0]} material={m.ceramic} castShadow>
          <cylinderGeometry args={[0.04, 0.036, 0.096, 24]} />
        </mesh>
        <mesh position={[0.045, 0.05, 0]} rotation-y={Math.PI / 2} material={m.ceramic} castShadow>
          <torusGeometry args={[0.022, 0.006, 8, 20]} />
        </mesh>
        <mesh position={[0, 0.094, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.004, 24]} />
          <meshStandardMaterial color="#3b2a1e" roughness={0.3} />
        </mesh>
      </group>
      <group position={[-0.42, 0, -0.14]} rotation-y={0.25}>
        <RoundedBox
          args={[0.15, 0.012, 0.21]}
          radius={0.003}
          smoothness={2}
          position={[0, 0.006, 0]}
          material={m.accent}
          castShadow
        />
        <mesh position={[0.002, 0.006, 0]} material={m.paper}>
          <boxGeometry args={[0.146, 0.008, 0.205]} />
        </mesh>
      </group>
      <RoundedBox
        args={[0.07, 0.008, 0.15]}
        radius={0.006}
        smoothness={2}
        position={[0.58, 0.004, -0.14]}
        rotation-y={-0.3}
        material={m.blackPlastic}
        castShadow
      />
      <Plant variant="desk" position={[0.66, 0, 0.3]} />
    </group>
  );
}
