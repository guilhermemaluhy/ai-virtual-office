import { RENDER_CONFIG } from '../../config/app.js';

/**
 * Luz natural: sol vindo de fora, pela fachada envidraçada (única luz com sombra),
 * mais céu/hemisfério e um pouco de luz ambiente para as áreas afastadas das janelas.
 * A luz artificial fica nos pendentes (spots) e na luminária de mesa.
 */
export function Lighting() {
  const size = RENDER_CONFIG.shadowMapSize;
  return (
    <>
      <ambientLight intensity={0.28} color="#dfe6ee" />
      <hemisphereLight args={['#cfe0f2', '#8a7a68', 0.6]} />
      <directionalLight
        name="sun"
        position={[-4.5, 7.5, -10]}
        intensity={3.2}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[size, size]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-radius={3}
      />
    </>
  );
}
