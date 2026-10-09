import { CameraControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import type { CameraControllerRef } from './cameraController.js';
import { CAMERA_LIMITS, INITIAL_VIEW, roomCameraBounds } from './cameraPresets.js';
import { isTypingTarget, keyToCameraAction } from './keyboard.js';

interface CameraRigProps {
  readonly controllerRef: CameraControllerRef;
}

/** Câmera orbital limitada ao interior da sala, com atalhos de teclado. */
export function CameraRig({ controllerRef }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { min, max } = roomCameraBounds();
    controls.setBoundary(new Box3(new Vector3(...min), new Vector3(...max)));
    controls.boundaryEnclosesCamera = true;

    const resetView = (smooth: boolean) => {
      void controls.setLookAt(...INITIAL_VIEW.position, ...INITIAL_VIEW.target, smooth);
    };
    resetView(false);
    controllerRef.current = { resetView: () => resetView(true) };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      const action = keyToCameraAction(event.key);
      if (!action) return;
      event.preventDefault();
      switch (action.kind) {
        case 'forward':
          void controls.forward(action.distance, true);
          break;
        case 'truck':
          void controls.truck(action.x, action.y, true);
          break;
        case 'rotate':
          void controls.rotate(action.azimuth, 0, true);
          break;
        case 'dolly':
          void controls.dolly(action.distance, true);
          break;
        case 'reset':
          resetView(true);
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      controllerRef.current = null;
    };
  }, [controllerRef]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      minPolarAngle={CAMERA_LIMITS.minPolarAngle}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      smoothTime={0.35}
      draggingSmoothTime={0.12}
      dollyToCursor
    />
  );
}
