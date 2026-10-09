import { useMemo } from 'react';
import { DoubleSide, Object3D } from 'three';
import { useMaterials } from '../materials/MaterialsProvider.js';

interface PendantLampProps {
  /** Comprimento do fio: a cúpula fica a essa distância do teto. */
  readonly drop: number;
  readonly intensity: number;
}

/** Luminária pendente com um spot real apontando para baixo (sem sombra, para economizar). */
export function PendantLamp({ drop, intensity }: PendantLampProps) {
  const m = useMaterials();
  const target = useMemo(() => new Object3D(), []);
  const shadeY = drop - 0.75; // o grupo nasce 0,75 m abaixo do teto (ver layout)

  return (
    <group name="pendant-lamp">
      <mesh position={[0, 0.75 - drop / 2, 0]} material={m.darkMetal}>
        <cylinderGeometry args={[0.004, 0.004, drop, 8]} />
      </mesh>
      <mesh position={[0, 0.75 - drop - 0.001, 0]} material={m.darkMetal}>
        <cylinderGeometry args={[0.07, 0.03, 0.02, 24]} />
      </mesh>
      <mesh position={[0, 0.75 - drop - 0.11, 0]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.06, 0.21, 0.2, 32, 1, true]} />
      </mesh>
      <mesh position={[0, 0.75 - drop - 0.16, 0]}>
        <cylinderGeometry args={[0.055, 0.2, 0.18, 32, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff0d8"
          emissiveIntensity={0.8}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.75 - drop - 0.12, 0]} material={m.bulb}>
        <sphereGeometry args={[0.03, 16, 12]} />
      </mesh>
      <spotLight
        position={[0, shadeY + 0.6, 0]}
        target={target}
        intensity={intensity}
        color="#ffe3c2"
        angle={0.75}
        penumbra={0.7}
        distance={6}
        decay={2}
      />
      <primitive object={target} position={[0, -2.5, 0]} />
    </group>
  );
}
