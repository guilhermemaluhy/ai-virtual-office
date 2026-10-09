import { RENDER_CONFIG } from '../../config/app.js';
import { ROOM } from '../../config/office.js';

/**
 * Iluminação base (Etapa 1): luz de céu + "sol" direcional com sombra suave.
 * A luz natural pelas janelas e as luminárias entram na Etapa 2.
 */
export function Lighting() {
  const half = Math.max(ROOM.width, ROOM.depth) / 2 + 1;
  return (
    <>
      <hemisphereLight args={['#dfe8f2', '#6b5d4f', 1.1]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-6, 9, 4]}
        intensity={2.2}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[RENDER_CONFIG.shadowMapSize, RENDER_CONFIG.shadowMapSize]}
        shadow-camera-left={-half}
        shadow-camera-right={half}
        shadow-camera-top={half}
        shadow-camera-bottom={-half}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
    </>
  );
}
