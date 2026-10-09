import { DoubleSide } from 'three';
import type { Vec3 } from '../../lib/math.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const POST_HEIGHT = 0.32;
const HEAD: Vec3 = [0.2, 0.44, 0]; // ponta do braço, onde fica a cúpula
const ARM_LENGTH = Math.hypot(HEAD[0], HEAD[1] - POST_HEIGHT);
const ARM_ANGLE = -Math.atan2(HEAD[0], HEAD[1] - POST_HEIGHT);

/** Luminária articulada: haste vertical, braço inclinado e cúpula com luz pontual quente. */
export function DeskLamp({ position }: { readonly position: Vec3 }) {
  const m = useMaterials();
  return (
    <group name="desk-lamp" position={position}>
      <mesh position={[0, 0.008, 0]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.016, 24]} />
      </mesh>
      <mesh position={[0, POST_HEIGHT / 2, 0]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.007, 0.007, POST_HEIGHT, 10]} />
      </mesh>
      <mesh position={[0, POST_HEIGHT, 0]} material={m.darkMetal}>
        <sphereGeometry args={[0.013, 12, 8]} />
      </mesh>
      <mesh
        position={[HEAD[0] / 2, (POST_HEIGHT + HEAD[1]) / 2, 0]}
        rotation-z={ARM_ANGLE}
        material={m.darkMetal}
        castShadow
      >
        <cylinderGeometry args={[0.007, 0.007, ARM_LENGTH, 10]} />
      </mesh>
      <group position={HEAD} rotation-z={0.35}>
        <mesh castShadow>
          <cylinderGeometry args={[0.025, 0.065, 0.13, 24, 1, true]} />
          <meshStandardMaterial
            color="#2b2e33"
            metalness={0.7}
            roughness={0.42}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={m.darkMetal}>
          <sphereGeometry args={[0.028, 12, 8]} />
        </mesh>
        <mesh position={[0, -0.03, 0]} material={m.bulb}>
          <sphereGeometry args={[0.02, 12, 8]} />
        </mesh>
        <pointLight
          position={[0, -0.08, 0]}
          intensity={2.2}
          distance={2.2}
          decay={2}
          color="#ffd9a8"
        />
      </group>
    </group>
  );
}
