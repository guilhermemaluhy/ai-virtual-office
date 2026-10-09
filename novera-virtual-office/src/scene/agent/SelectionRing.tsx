import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MeshBasicMaterial } from 'three';

/** Anel no piso em volta da cadeira enquanto o agente está selecionado. */
export function SelectionRing({ visible }: { readonly visible: boolean }) {
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current) material.current.opacity = 0.55 + 0.3 * Math.sin(clock.elapsedTime * 3);
  });
  return (
    <mesh position={[0, 0.012, 0.1]} rotation-x={-Math.PI / 2} visible={visible}>
      <ringGeometry args={[0.44, 0.5, 56]} />
      <meshBasicMaterial ref={material} color="#5fa8d3" transparent opacity={0.8} />
    </mesh>
  );
}
