import { useMemo } from 'react';
import { createRandom } from '../../lib/math.js';
import { InstancedGroup, type InstanceItem } from '../lib/InstancedGroup.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const BUILDING_COLORS = ['#7d8793', '#8e98a3', '#6b7684', '#a3aab2', '#5f6b7a', '#b9c0c7'] as const;

function generateBuildings(): InstanceItem[] {
  const rng = createRandom(101);
  const items: InstanceItem[] = [];
  for (let i = 0; i < 70; i += 1) {
    const w = 5 + rng() * 6;
    const d = 5 + rng() * 6;
    const h = 8 + rng() * 34;
    const x = -80 + rng() * 160;
    const z = -24 - rng() * 70;
    items.push({
      position: [x, h / 2 - 0.05, z],
      scale: [w, h, d],
      color: BUILDING_COLORS[i % BUILDING_COLORS.length] ?? '#7d8793',
    });
  }
  return items;
}

function generateTrees(): { trunks: InstanceItem[]; canopies: InstanceItem[] } {
  const rng = createRandom(202);
  const trunks: InstanceItem[] = [];
  const canopies: InstanceItem[] = [];
  for (let i = 0; i < 18; i += 1) {
    const x = -36 + rng() * 72;
    const z = -14 - rng() * 7;
    const h = 2.8 + rng() * 1.6;
    const r = 1.3 + rng() * 0.8;
    trunks.push({ position: [x, h / 2, z], scale: [0.18, h, 0.18] });
    canopies.push({ position: [x, h + r * 0.7, z], scale: [r, r * 1.1, r] });
  }
  return { trunks, canopies };
}

/** O que se vê pelas janelas: céu, terraço, rua, árvores e prédios ao longe. */
export function Exterior() {
  const m = useMaterials();
  const buildings = useMemo(generateBuildings, []);
  const trees = useMemo(generateTrees, []);

  return (
    <group name="exterior">
      <mesh material={m.sky}>
        <sphereGeometry args={[150, 32, 16]} />
      </mesh>
      <mesh position={[0, -0.03, -60]} rotation-x={-Math.PI / 2} material={m.concrete}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <mesh position={[0, -0.02, -7]} rotation-x={-Math.PI / 2} material={m.concrete} receiveShadow>
        <planeGeometry args={[60, 5]} />
      </mesh>
      <mesh position={[0, -0.025, -12]} rotation-x={-Math.PI / 2} material={m.asphalt}>
        <planeGeometry args={[200, 5]} />
      </mesh>
      <InstancedGroup
        items={trees.trunks}
        material={m.bark}
        geometry={<cylinderGeometry args={[0.5, 0.6, 1, 8]} />}
      />
      <InstancedGroup
        items={trees.canopies}
        material={m.treeCanopy}
        geometry={<sphereGeometry args={[1, 12, 8]} />}
      />
      <InstancedGroup items={buildings} material={m.building} geometry={<boxGeometry />} />
    </group>
  );
}
