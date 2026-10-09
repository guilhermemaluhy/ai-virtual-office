import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three';
import { RENDER_CONFIG } from '../config/app.js';
import { RoomShell } from './architecture/RoomShell.js';
import type { CameraControllerRef } from './camera/cameraController.js';
import { CAMERA_LIMITS, INITIAL_VIEW } from './camera/cameraPresets.js';
import { CameraRig } from './camera/CameraRig.js';
import { Lighting } from './lighting/Lighting.js';

export interface OfficeCanvasProps {
  readonly controllerRef: CameraControllerRef;
  readonly onReady: () => void;
  readonly onContextLost: () => void;
}

/** Ponto de entrada da cena 3D. Não contém regra de negócio: só reflete o estado recebido. */
export function OfficeCanvas({ controllerRef, onReady, onContextLost }: OfficeCanvasProps) {
  return (
    <Canvas
      className="office-canvas"
      frameloop={RENDER_CONFIG.frameloop}
      dpr={[...RENDER_CONFIG.dpr]}
      shadows={{ type: PCFShadowMap }}
      camera={{
        fov: CAMERA_LIMITS.fov,
        near: 0.05,
        far: 100,
        position: [...INITIAL_VIEW.position],
      }}
      gl={{
        antialias: RENDER_CONFIG.antialias,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
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
      <color attach="background" args={['#11151c']} />
      <Suspense fallback={null}>
        <Lighting />
        <RoomShell />
      </Suspense>
      <CameraRig controllerRef={controllerRef} />
    </Canvas>
  );
}
