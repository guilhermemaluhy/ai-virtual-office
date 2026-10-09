import { ROOM } from '../../config/office.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

export function Floor() {
  const m = useMaterials();
  return (
    <mesh name="floor" rotation-x={-Math.PI / 2} receiveShadow material={m.floor}>
      <planeGeometry args={[ROOM.width, ROOM.depth]} />
    </mesh>
  );
}
