/**
 * Ponte entre a interface (fora do Canvas) e a câmera (dentro do Canvas).
 * A UI só conhece esta interface, nunca a biblioteca de controles.
 */
export interface CameraController {
  resetView(): void;
  focusAgent(): void;
}

export interface CameraControllerRef {
  current: CameraController | null;
}
