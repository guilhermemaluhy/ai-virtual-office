import { CURTAIN_WALL, ROOM } from '../../config/office.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_DEPTH = 0.016;

/** Paredes com a abertura da fachada envidraçada no fundo (Z negativo) e rodapés. */
export function Walls() {
  const m = useMaterials();
  const { width: W, depth: D, height: H, wallThickness: t } = ROOM;
  const { sill, head, span } = CURTAIN_WALL;
  const pierWidth = (W + 2 * t - span) / 2;

  return (
    <group name="walls">
      {/* Parede do fundo: peitoril, verga e pilares laterais em volta do vidro */}
      <mesh position={[0, sill / 2, -D / 2 - t / 2]} receiveShadow castShadow material={m.wall}>
        <boxGeometry args={[W + 2 * t, sill, t]} />
      </mesh>
      <mesh
        position={[0, (H + head) / 2, -D / 2 - t / 2]}
        receiveShadow
        castShadow
        material={m.wall}
      >
        <boxGeometry args={[W + 2 * t, H - head, t]} />
      </mesh>
      <mesh
        position={[-(W + 2 * t) / 2 + pierWidth / 2, H / 2, -D / 2 - t / 2]}
        receiveShadow
        castShadow
        material={m.wall}
      >
        <boxGeometry args={[pierWidth, H, t]} />
      </mesh>
      <mesh
        position={[(W + 2 * t) / 2 - pierWidth / 2, H / 2, -D / 2 - t / 2]}
        receiveShadow
        castShadow
        material={m.wall}
      >
        <boxGeometry args={[pierWidth, H, t]} />
      </mesh>

      {/* Demais paredes */}
      <mesh position={[-W / 2 - t / 2, H / 2, 0]} receiveShadow material={m.wall}>
        <boxGeometry args={[t, H, D]} />
      </mesh>
      <mesh position={[W / 2 + t / 2, H / 2, 0]} receiveShadow material={m.wall}>
        <boxGeometry args={[t, H, D]} />
      </mesh>
      <mesh position={[0, H / 2, D / 2 + t / 2]} receiveShadow material={m.wall}>
        <boxGeometry args={[W + 2 * t, H, t]} />
      </mesh>

      {/* Rodapés */}
      <mesh position={[-W / 2 + BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, 0]} material={m.trim}>
        <boxGeometry args={[BASEBOARD_DEPTH, BASEBOARD_HEIGHT, D]} />
      </mesh>
      <mesh position={[W / 2 - BASEBOARD_DEPTH / 2, BASEBOARD_HEIGHT / 2, 0]} material={m.trim}>
        <boxGeometry args={[BASEBOARD_DEPTH, BASEBOARD_HEIGHT, D]} />
      </mesh>
      <mesh position={[0, BASEBOARD_HEIGHT / 2, D / 2 - BASEBOARD_DEPTH / 2]} material={m.trim}>
        <boxGeometry args={[W, BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
      </mesh>
      <mesh position={[0, BASEBOARD_HEIGHT / 2, -D / 2 + BASEBOARD_DEPTH / 2]} material={m.trim}>
        <boxGeometry args={[W, BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
      </mesh>
    </group>
  );
}
