import { Environment, Lightformer } from '@react-three/drei';
import { BackSide } from 'three';

/**
 * Mapa de ambiente gerado na própria cena (sem arquivos HDR externos): dá reflexos
 * plausíveis a vidro, metal e madeira. Renderizado uma única vez.
 */
export function EnvironmentMap() {
  return (
    <Environment resolution={256} frames={1}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color="#4a5058" side={BackSide} />
      </mesh>
      {/* forro iluminado */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#fff6ea"
        position={[0, 6, 0]}
        rotation-x={Math.PI / 2}
        scale={[12, 9, 1]}
      />
      {/* fachada envidraçada */}
      <Lightformer
        form="rect"
        intensity={2.8}
        color="#dfeeff"
        position={[0, 2, -8]}
        scale={[12, 3.5, 1]}
      />
      {/* parede clara oposta */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#f3eee6"
        position={[0, 1.5, 8]}
        rotation-y={Math.PI}
        scale={[12, 3, 1]}
      />
    </Environment>
  );
}
