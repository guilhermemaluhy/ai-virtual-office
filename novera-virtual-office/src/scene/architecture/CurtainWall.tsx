import { useMemo } from 'react';
import { CURTAIN_WALL, curtainWallPanes, ROOM } from '../../config/office.js';
import { InstancedGroup, type InstanceItem } from '../lib/InstancedGroup.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const FRAME_DEPTH = 0.14;

/** Fachada envidraçada: vidro contínuo, montantes, travessa, peitoril e caixilho. */
export function CurtainWall() {
  const m = useMaterials();
  const { sill, head, span, mullion, transom } = CURTAIN_WALL;
  const z = -ROOM.depth / 2 - ROOM.wallThickness / 2;
  const glassHeight = head - sill;
  const centerY = (head + sill) / 2;

  const frames = useMemo<InstanceItem[]>(() => {
    const panes = curtainWallPanes();
    const items: InstanceItem[] = [];
    // montantes verticais nas bordas e entre painéis
    const edges = [-span / 2 + mullion / 2, ...panes.map((p) => p.x + p.width / 2 + mullion / 2)];
    edges.forEach((x) =>
      items.push({ position: [x, centerY, z], scale: [mullion, glassHeight, FRAME_DEPTH] }),
    );
    // travessa horizontal, soleira e verga do caixilho
    items.push({ position: [0, transom, z], scale: [span, mullion * 0.7, FRAME_DEPTH] });
    items.push({ position: [0, sill + mullion / 2, z], scale: [span, mullion, FRAME_DEPTH] });
    items.push({ position: [0, head - mullion / 2, z], scale: [span, mullion, FRAME_DEPTH] });
    return items;
  }, [span, mullion, centerY, z, glassHeight, transom, sill, head]);

  return (
    <group name="curtain-wall">
      <mesh position={[0, centerY, z]} material={m.glass}>
        <planeGeometry args={[span, glassHeight]} />
      </mesh>
      <InstancedGroup
        items={frames}
        material={m.darkMetal}
        castShadow
        receiveShadow
        geometry={<boxGeometry />}
      />
      {/* peitoril interno */}
      <mesh
        position={[0, sill + 0.02, -ROOM.depth / 2 + 0.1]}
        material={m.trim}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[span + 0.3, 0.04, 0.24]} />
      </mesh>
    </group>
  );
}
