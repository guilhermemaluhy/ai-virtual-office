import { ROOM, type RoomDimensions } from '../../config/office.js';
import type { Vec3 } from '../../lib/math.js';

export type { Vec3 };

export interface CameraPreset {
  readonly position: Vec3;
  readonly target: Vec3;
}

export interface CameraBounds {
  readonly min: Vec3;
  readonly max: Vec3;
}

/** Folga entre a câmera e as paredes/teto, para a lente não "entrar" na parede. */
const WALL_MARGIN = 0.35;

/** Caixa em que a câmera (e o ponto observado) devem permanecer: o interior da sala. */
export function roomCameraBounds(room: RoomDimensions = ROOM): CameraBounds {
  const halfW = room.width / 2 - WALL_MARGIN;
  const halfD = room.depth / 2 - WALL_MARGIN;
  return {
    min: [-halfW, 0.4, -halfD],
    max: [halfW, room.height - WALL_MARGIN, halfD],
  };
}

export function isInsideBounds(point: Vec3, bounds: CameraBounds): boolean {
  return point.every((value, axis) => value >= bounds.min[axis]! && value <= bounds.max[axis]!);
}

/** Visão inicial: canto da sala, altura de quem observa em pé, olhando para o centro. */
export const INITIAL_VIEW: CameraPreset = {
  position: [2.8, 1.65, 2.5],
  target: [-1.0, 0.9, -0.9],
};

/** Limites de navegação (metros e radianos). */
export const CAMERA_LIMITS = {
  minDistance: 1.0,
  maxDistance: 10,
  /** Não deixa olhar de baixo do piso nem exatamente de cima. */
  minPolarAngle: 0.25,
  maxPolarAngle: Math.PI / 2 - 0.05,
  fov: 50,
} as const;
