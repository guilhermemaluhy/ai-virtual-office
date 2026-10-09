import { ROOM } from '../../config/office.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const PANEL_POSITIONS: readonly (readonly [number, number])[] = [
  [-3.2, -2.2],
  [-3.2, 2.2],
  [3.2, -2.2],
  [3.2, 2.2],
];

/** Forro com luminárias embutidas (apenas visuais: a luz vem da iluminação geral). */
export function Ceiling() {
  const m = useMaterials();
  const { width, depth, height } = ROOM;
  return (
    <group name="ceiling">
      <mesh position={[0, height, 0]} rotation-x={Math.PI / 2} material={m.ceiling}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      {PANEL_POSITIONS.map(([x, z]) => (
        <group key={`${x}:${z}`} position={[x, height - 0.012, z]}>
          <mesh material={m.trim}>
            <boxGeometry args={[1.3, 0.024, 0.7]} />
          </mesh>
          <mesh position-y={-0.013} material={m.lightPanel}>
            <boxGeometry args={[1.2, 0.004, 0.6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
