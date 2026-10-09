import { CameraControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import type { CameraControllerRef } from './cameraController.js';
import { useColliderRegistry } from './colliders.js';
import {
  AGENT_VIEW,
  CAMERA_LIMITS,
  INITIAL_VIEW,
  roomCameraBounds,
  type CameraPreset,
} from './cameraPresets.js';
import { isTypingTarget, keyToCameraAction } from './keyboard.js';

interface CameraRigProps {
  readonly controllerRef: CameraControllerRef;
}

/** Câmera orbital limitada ao interior da sala, com atalhos de teclado. */
export function CameraRig({ controllerRef }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null);
  const colliders = useColliderRegistry();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { min, max } = roomCameraBounds();
    controls.setBoundary(new Box3(new Vector3(...min), new Vector3(...max)));
    controls.boundaryEnclosesCamera = true;
    // Móveis grandes registrados em `colliders` impedem a câmera de atravessá-los.
    if (colliders) controls.colliderMeshes = colliders.list;

    const goTo = (view: CameraPreset, smooth: boolean) => {
      void controls.setLookAt(...view.position, ...view.target, smooth);
    };
    const resetView = (smooth: boolean) => goTo(INITIAL_VIEW, smooth);
    resetView(false);
    controllerRef.current = {
      resetView: () => resetView(true),
      focusAgent: () => goTo(AGENT_VIEW, true),
    };

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
  }, [controllerRef, colliders]);

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
