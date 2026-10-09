import { Object3D, Quaternion, Vector3, type Material } from 'three';
import type { Vec3 } from '../../lib/math.js';

const UP = new Vector3(0, 1, 0);
const from = new Vector3();
const to = new Vector3();
const direction = new Vector3();
const quaternion = new Quaternion();

/** Posiciona um cilindro de altura unitária entre dois pontos (eixo Y local vira o segmento). */
export function orientLimb(object: Object3D, start: Vec3, end: Vec3): void {
  from.set(...start);
  to.set(...end);
  direction.subVectors(to, from);
  const length = direction.length();
  object.position.copy(from).addScaledVector(direction, 0.5);
  object.quaternion.copy(quaternion.setFromUnitVectors(UP, direction.normalize()));
  object.scale.set(1, Math.max(length, 0.001), 1);
}

interface LimbProps {
  readonly from: Vec3;
  readonly to: Vec3;
  readonly radius: number;
  readonly material: Material;
  /** Esfera na ponta `to` (cotovelo, joelho) para esconder a emenda. */
  readonly joint?: boolean;
}

/** Segmento estático de membro. Para segmentos animados use `orientLimb` com um ref. */
export function Limb({ from: start, to: end, radius, material, joint = true }: LimbProps) {
  return (
    <group>
      <mesh
        ref={(mesh) => {
          if (mesh) orientLimb(mesh, start, end);
        }}
        material={material}
        castShadow
      >
        <cylinderGeometry args={[radius, radius, 1, 14]} />
      </mesh>
      {joint && (
        <mesh position={end} material={material} castShadow>
          <sphereGeometry args={[radius, 14, 10]} />
        </mesh>
      )}
    </group>
  );
}
