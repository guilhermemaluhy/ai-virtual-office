import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import type { Vec3 } from '../../lib/math.js';
import { InstancedGroup, type InstanceItem } from '../lib/InstancedGroup.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const ROWS = 5;
const COLS = 14;
const PITCH = 0.0295;
const KEY = 0.024;

function buildKeys(): InstanceItem[] {
  const items: InstanceItem[] = [];
  const x0 = -((COLS - 1) * PITCH) / 2;
  const z0 = -((ROWS - 1) * PITCH) / 2;
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const isSpaceRow = r === ROWS - 1 && c >= 4 && c <= 9;
      if (isSpaceRow) continue;
      items.push({ position: [x0 + c * PITCH, 0.021, z0 + r * PITCH], scale: [KEY, 0.009, KEY] });
    }
  }
  items.push({
    position: [x0 + 6.5 * PITCH, 0.021, z0 + (ROWS - 1) * PITCH],
    scale: [PITCH * 6 - 0.005, 0.009, KEY],
  });
  return items;
}

/** Teclado compacto: base e teclas em um único draw call. */
export function Keyboard({ position }: { readonly position: Vec3 }) {
  const m = useMaterials();
  const keys = useMemo(buildKeys, []);
  return (
    <group name="keyboard" position={position}>
      <RoundedBox
        args={[COLS * PITCH + 0.02, 0.016, ROWS * PITCH + 0.02]}
        radius={0.004}
        smoothness={2}
        position={[0, 0.008, 0]}
        material={m.greyPlastic}
        castShadow
      />
      <InstancedGroup items={keys} material={m.blackPlastic} geometry={<boxGeometry />} />
    </group>
  );
}
