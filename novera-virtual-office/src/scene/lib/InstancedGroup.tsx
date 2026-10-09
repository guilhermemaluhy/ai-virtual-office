import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3, type Material } from 'three';
import type { Vec3 } from '../../lib/math.js';

export interface InstanceItem {
  readonly position: Vec3;
  readonly scale: Vec3;
  readonly rotation?: Vec3;
  readonly color?: string;
}

interface InstancedGroupProps {
  readonly items: readonly InstanceItem[];
  readonly material: Material;
  readonly geometry: ReactNode;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly name?: string;
}

const matrix = new Matrix4();
const position = new Vector3();
const quaternion = new Quaternion();
const euler = new Euler();
const scale = new Vector3();
const color = new Color();

/**
 * Vários objetos iguais em um único draw call (livros, teclas, prédios, folhas).
 * As matrizes são gravadas uma vez; em `frameloop="demand"` pedimos um novo quadro.
 */
export function InstancedGroup({
  items,
  material,
  geometry,
  castShadow = false,
  receiveShadow = false,
  name = 'instanced-group',
}: InstancedGroupProps) {
  const ref = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((item, index) => {
      position.set(...item.position);
      scale.set(...item.scale);
      const [rx, ry, rz] = item.rotation ?? [0, 0, 0];
      quaternion.setFromEuler(euler.set(rx, ry, rz));
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(index, matrix);
      if (item.color) mesh.setColorAt(index, color.set(item.color));
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
  }, [items, invalidate]);

  return (
    <instancedMesh
      ref={ref}
      name={name}
      args={[undefined, undefined, Math.max(1, items.length)]}
      material={material}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    >
      {geometry}
    </instancedMesh>
  );
}
