/** Ações de câmera disparadas pelo teclado. Mapeamento puro, testável sem WebGL. */
export type CameraKeyAction =
  | { readonly kind: 'truck'; readonly x: number; readonly y: number }
  | { readonly kind: 'forward'; readonly distance: number }
  | { readonly kind: 'rotate'; readonly azimuth: number }
  | { readonly kind: 'dolly'; readonly distance: number }
  | { readonly kind: 'reset' };

const STEP = 0.4; // metros por toque
const TURN = Math.PI / 24; // 7,5° por toque

export function keyToCameraAction(key: string): CameraKeyAction | null {
  switch (key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      return { kind: 'forward', distance: STEP };
    case 's':
    case 'arrowdown':
      return { kind: 'forward', distance: -STEP };
    case 'a':
    case 'arrowleft':
      return { kind: 'truck', x: -STEP, y: 0 };
    case 'd':
    case 'arrowright':
      return { kind: 'truck', x: STEP, y: 0 };
    case 'q':
      return { kind: 'rotate', azimuth: TURN };
    case 'e':
      return { kind: 'rotate', azimuth: -TURN };
    case '+':
    case '=':
      return { kind: 'dolly', distance: STEP };
    case '-':
      return { kind: 'dolly', distance: -STEP };
    case 'r':
    case 'home':
      return { kind: 'reset' };
    default:
      return null;
  }
}

/** Não captura teclas enquanto o usuário digita em um campo. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
