import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three';
import { RENDER_CONFIG } from '../config/app.js';
import { Ceiling } from './architecture/Ceiling.js';
import { CurtainWall } from './architecture/CurtainWall.js';
import { Exterior } from './architecture/Exterior.js';
import { Floor } from './architecture/Floor.js';
import { Walls } from './architecture/Walls.js';
import type { CameraControllerRef } from './camera/cameraController.js';
import { CAMERA_LIMITS, INITIAL_VIEW } from './camera/cameraPresets.js';
import { CameraRig } from './camera/CameraRig.js';
import { CameraCollidersProvider } from './camera/colliders.js';
import { RenderStats } from './debug/RenderStats.js';
import { Furniture } from './furniture/Furniture.js';
import { EnvironmentMap } from './lighting/EnvironmentMap.js';
import { Lighting } from './lighting/Lighting.js';
import { MaterialsProvider } from './materials/MaterialsProvider.js';

export interface OfficeCanvasProps {
  readonly controllerRef: CameraControllerRef;
  readonly onReady: () => void;
  readonly onContextLost: () => void;
  readonly showStats?: boolean;
}

/** Ponto de entrada da cena 3D. Não contém regra de negócio: só reflete o estado recebido. */
export function OfficeCanvas({
  controllerRef,
  onReady,
  onContextLost,
  showStats = false,
}: OfficeCanvasProps) {
  return (
    <Canvas
      className="office-canvas"
      frameloop={RENDER_CONFIG.frameloop}
      dpr={[...RENDER_CONFIG.dpr]}
      shadows={{ type: PCFShadowMap }}
      camera={{
        fov: CAMERA_LIMITS.fov,
        near: 0.05,
        far: 400,
        position: [...INITIAL_VIEW.position],
      }}
      gl={{
        antialias: RENDER_CONFIG.antialias,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: RENDER_CONFIG.exposure,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost();
        });
        onReady();
      }}
    >
      <color attach="background" args={['#c7d3df']} />
      <fog attach="fog" args={['#c7d3df', 28, 110]} />
      <CameraCollidersProvider>
        <Suspense fallback={null}>
          <MaterialsProvider>
            <Lighting />
            <EnvironmentMap />
            <Exterior />
            <Floor />
            <Walls />
            <CurtainWall />
            <Ceiling />
            <Furniture />
          </MaterialsProvider>
        </Suspense>
        <CameraRig controllerRef={controllerRef} />
      </CameraCollidersProvider>
      {showStats && <RenderStats />}
    </Canvas>
  );
}
