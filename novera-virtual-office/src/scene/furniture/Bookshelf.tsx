import { useMemo } from 'react';
import { createRandom } from '../../lib/math.js';
import { InstancedGroup, type InstanceItem } from '../lib/InstancedGroup.js';
import { useMaterials } from '../materials/MaterialsProvider.js';
import { Plant } from './Plant.js';

const WIDTH = 1.2;
const HEIGHT = 2.1;
const DEPTH = 0.36;
const SHELF_YS = [0.04, 0.5, 0.95, 1.4, 1.85] as const;
const BOOK_COLORS = [
  '#1f2d3d',
  '#5fa8d3',
  '#c89b6d',
  '#8c3b3b',
  '#3f6b4f',
  '#e0b354',
  '#6b5b95',
  '#2b2e33',
  '#b5b0a8',
] as const;

function buildBooks(): InstanceItem[] {
  const rng = createRandom(303);
  const items: InstanceItem[] = [];
  const shelves = [SHELF_YS[0], SHELF_YS[1], SHELF_YS[2], SHELF_YS[3]];
  shelves.forEach((shelfY, shelfIndex) => {
    const base = shelfY + 0.0125;
    let x = -WIDTH / 2 + 0.06;
    const fill = 0.45 + rng() * 0.35;
    while (x < -WIDTH / 2 + 0.06 + (WIDTH - 0.12) * fill) {
      const w = 0.02 + rng() * 0.03;
      const h = 0.17 + rng() * 0.1;
      const d = 0.16 + rng() * 0.06;
      items.push({
        position: [x + w / 2, base + h / 2, -0.03 + (rng() - 0.5) * 0.02],
        scale: [w, h, d],
        color: BOOK_COLORS[Math.floor(rng() * BOOK_COLORS.length)] ?? '#1f2d3d',
      });
      x += w + 0.002;
    }
    // uma caixa ou pasta ao lado dos livros
    if (shelfIndex % 2 === 0) {
      items.push({
        position: [WIDTH / 2 - 0.2, base + 0.11, -0.02],
        scale: [0.28, 0.22, 0.26],
        color: '#c9b79c',
      });
    } else {
      items.push({
        position: [WIDTH / 2 - 0.12, base + 0.15, -0.02],
        scale: [0.07, 0.3, 0.26],
        color: '#2f4f6b',
      });
      items.push({
        position: [WIDTH / 2 - 0.2, base + 0.15, -0.02],
        scale: [0.07, 0.3, 0.26],
        color: '#8c3b3b',
      });
    }
  });
  return items;
}

/** Estante alta em nogueira com livros, pastas e uma planta no topo. Frente em +Z. */
export function Bookshelf() {
  const m = useMaterials();
  const books = useMemo(buildBooks, []);
  return (
    <group name="bookshelf">
      {[-WIDTH / 2 + 0.0125, WIDTH / 2 - 0.0125].map((x) => (
        <mesh key={x} position={[x, HEIGHT / 2, 0]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[0.025, HEIGHT, DEPTH]} />
        </mesh>
      ))}
      <mesh position={[0, HEIGHT - 0.0125, 0]} material={m.walnut} castShadow>
        <boxGeometry args={[WIDTH, 0.025, DEPTH]} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, -DEPTH / 2 + 0.006]} material={m.walnut} receiveShadow>
        <boxGeometry args={[WIDTH - 0.05, HEIGHT, 0.012]} />
      </mesh>
      {SHELF_YS.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[WIDTH - 0.05, 0.025, DEPTH - 0.02]} />
        </mesh>
      ))}
      <InstancedGroup
        items={books}
        material={m.paper}
        castShadow
        receiveShadow
        geometry={<boxGeometry />}
      />
      <Plant variant="desk" position={[-0.35, SHELF_YS[4] + 0.0125, 0]} seed={9} />
    </group>
  );
}
