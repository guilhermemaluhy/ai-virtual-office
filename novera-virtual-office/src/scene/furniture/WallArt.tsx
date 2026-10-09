import type { Vec3 } from '../../lib/math.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

interface WallArtProps {
  readonly size: readonly [width: number, height: number];
  readonly variant: 0 | 1;
  readonly position?: Vec3;
  readonly rotation?: Vec3;
}

/** Quadro emoldurado; a imagem é uma arte abstrata procedural. Frente em +Z. */
export function WallArt({
  size,
  variant,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: WallArtProps) {
  const m = useMaterials();
  const [w, h] = size;
  return (
    <group name="wall-art" position={position} rotation={rotation}>
      <mesh material={m.darkMetal} castShadow>
        <boxGeometry args={[w, h, 0.035]} />
      </mesh>
      <mesh position={[0, 0, 0.012]} material={m.paper}>
        <boxGeometry args={[w - 0.05, h - 0.05, 0.014]} />
      </mesh>
      <mesh position={[0, 0, 0.0195]} material={m.art[variant]}>
        <planeGeometry args={[w - 0.09, h - 0.09]} />
      </mesh>
    </group>
  );
}
