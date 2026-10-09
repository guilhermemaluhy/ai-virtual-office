import { useMemo } from 'react';
import { Euler, Quaternion, Vector3 } from 'three';
import { createRandom, type Vec3 } from '../../lib/math.js';
import { InstancedGroup, type InstanceItem } from '../lib/InstancedGroup.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

interface PlantProps {
  readonly variant: 'floor' | 'desk';
  readonly position?: Vec3;
  readonly seed?: number;
}

interface PlantParts {
  readonly stems: InstanceItem[];
  readonly leaves: InstanceItem[];
}

const UP = new Vector3(0, 1, 0);
const quaternion = new Quaternion();
const euler = new Euler();

/** Euler que alinha o eixo Y local com a direção dada. */
function alignToDirection(dx: number, dy: number, dz: number): Vec3 {
  quaternion.setFromUnitVectors(UP, new Vector3(dx, dy, dz).normalize());
  euler.setFromQuaternion(quaternion);
  return [euler.x, euler.y, euler.z];
}

function buildPlant(variant: PlantProps['variant'], seed: number): PlantParts {
  const rng = createRandom(seed);
  const stems: InstanceItem[] = [];
  const leaves: InstanceItem[] = [];
  const potTop = variant === 'floor' ? 0.4 : 0.11;
  const leafCount = variant === 'floor' ? 24 : 9;
  const reach = variant === 'floor' ? 0.9 : 0.16;
  const leafSize = variant === 'floor' ? 0.19 : 0.05;
  for (let i = 0; i < leafCount; i += 1) {
    const angle = (i / leafCount) * Math.PI * 2 + rng() * 0.6;
    const tilt = 0.35 + rng() * 0.6; // 0 = vertical
    const length = reach * (0.5 + rng() * 0.5);
    const dx = Math.sin(angle) * Math.sin(tilt);
    const dz = Math.cos(angle) * Math.sin(tilt);
    const dy = Math.cos(tilt);
    // haste do centro do vaso até a folha
    stems.push({
      position: [(dx * length) / 2, potTop + (dy * length) / 2, (dz * length) / 2],
      scale: [1, length, 1],
      rotation: alignToDirection(dx, dy, dz),
    });
    leaves.push({
      position: [dx * length, potTop + dy * length + leafSize * 0.4, dz * length],
      scale: [leafSize * 0.55, leafSize, leafSize * 0.12],
      rotation: alignToDirection(dx * 0.6, dy, dz * 0.6),
    });
  }
  return { stems, leaves };
}

/** Planta ornamental procedural (vaso + hastes + folhas instanciadas). */
export function Plant({ variant, position = [0, 0, 0], seed = 5 }: PlantProps) {
  const m = useMaterials();
  const parts = useMemo(() => buildPlant(variant, seed), [variant, seed]);
  const floor = variant === 'floor';
  const potHeight = floor ? 0.4 : 0.11;
  const potRadius = floor ? 0.17 : 0.05;

  return (
    <group name={`plant-${variant}`} position={position}>
      <mesh
        position={[0, potHeight / 2, 0]}
        material={floor ? m.ceramicDark : m.ceramic}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[potRadius, potRadius * 0.8, potHeight, 28]} />
      </mesh>
      <mesh position={[0, potHeight - 0.01, 0]}>
        <cylinderGeometry args={[potRadius * 0.92, potRadius * 0.92, 0.01, 28]} />
        <meshStandardMaterial color="#3a2a1d" roughness={1} />
      </mesh>
      <InstancedGroup
        items={parts.stems}
        material={m.bark}
        geometry={<cylinderGeometry args={[floor ? 0.012 : 0.003, floor ? 0.016 : 0.004, 1, 6]} />}
      />
      <InstancedGroup
        items={parts.leaves}
        material={m.leaf}
        castShadow
        geometry={<sphereGeometry args={[1, 12, 8]} />}
      />
    </group>
  );
}
