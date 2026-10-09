import { ROOM, type RoomDimensions } from '../config/office.js';
import { rotateY, type Vec3 } from '../lib/math.js';

export type PlacementKind = 'furniture' | 'rug' | 'wall' | 'ceiling';

/**
 * Onde cada peça fica no escritório. Um item "olha" para +Z no seu espaço local;
 * `rotationY` o vira para a direção desejada no mundo. `size` é a caixa envolvente
 * local (largura X, altura Y, profundidade Z), centrada em X/Z e apoiada em Y = 0.
 */
export interface Placement {
  readonly id: string;
  readonly kind: PlacementKind;
  readonly position: Vec3;
  readonly rotationY: number;
  readonly size: readonly [width: number, height: number, depth: number];
  /** A câmera não deve atravessar este objeto. */
  readonly blocksCamera?: boolean;
  /** Itens com os quais pode se sobrepor de propósito (ex.: cadeira encostada sob a mesa). */
  readonly allowOverlap?: readonly string[];
}

const HALF_PI = Math.PI / 2;

export const PLACEMENTS = [
  // Estação de trabalho: o agente senta em X negativo e olha para +X.
  // Mesa e cadeira são o centro de órbita da câmera, por isso não bloqueiam a câmera.
  {
    id: 'desk',
    kind: 'furniture',
    position: [-1.0, 0, -0.9],
    rotationY: HALF_PI,
    size: [1.6, 0.75, 0.8],
  },
  {
    id: 'chair',
    kind: 'furniture',
    position: [-1.62, 0, -0.9],
    rotationY: HALF_PI,
    size: [0.66, 1.25, 0.66],
    allowOverlap: ['desk'], // o assento entra 11 cm sob o tampo, como numa mesa de verdade
  },
  {
    id: 'pedestal',
    kind: 'furniture',
    position: [-1.0, 0, 0.25],
    rotationY: HALF_PI,
    size: [0.42, 0.6, 0.55],
    blocksCamera: true,
  },
  { id: 'rugWork', kind: 'rug', position: [-1.3, 0, -0.9], rotationY: 0, size: [3.0, 0.01, 2.6] },

  // Armazenamento e decoração
  {
    id: 'bookshelf',
    kind: 'furniture',
    position: [-5.82, 0, -2.4],
    rotationY: HALF_PI,
    size: [1.2, 2.1, 0.36],
    blocksCamera: true,
  },
  {
    id: 'sideboard',
    kind: 'furniture',
    position: [1.8, 0, 4.275],
    rotationY: Math.PI,
    size: [1.8, 0.78, 0.45],
    blocksCamera: true,
  },
  {
    id: 'plantFront',
    kind: 'furniture',
    position: [-5.4, 0, 3.9],
    rotationY: 0.4,
    size: [0.7, 1.7, 0.7],
  },
  {
    id: 'plantBack',
    kind: 'furniture',
    position: [5.4, 0, -3.9],
    rotationY: 2.1,
    size: [0.7, 1.7, 0.7],
  },

  // Área de estar junto à parede direita
  {
    id: 'sofa',
    kind: 'furniture',
    position: [5.55, 0, -0.6],
    rotationY: -HALF_PI,
    size: [1.8, 0.85, 0.9],
    blocksCamera: true,
  },
  {
    id: 'coffeeTable',
    kind: 'furniture',
    position: [4.4, 0, -0.6],
    rotationY: 0,
    size: [0.8, 0.42, 0.8],
    blocksCamera: true,
  },
  { id: 'rugLounge', kind: 'rug', position: [4.7, 0, -0.6], rotationY: 0, size: [2.6, 0.01, 2.6] },

  // Itens de parede (3 cm à frente da parede)
  {
    id: 'door',
    kind: 'wall',
    position: [5.97, 0, 2.6],
    rotationY: -HALF_PI,
    size: [1.0, 2.2, 0.06],
  },
  {
    id: 'artLeft',
    kind: 'wall',
    position: [-5.97, 1.55, 0.6],
    rotationY: HALF_PI,
    size: [0.9, 0.7, 0.05],
  },
  {
    id: 'artFront',
    kind: 'wall',
    position: [1.8, 1.7, 4.47],
    rotationY: Math.PI,
    size: [1.2, 0.8, 0.05],
  },
  {
    id: 'clock',
    kind: 'wall',
    position: [-5.97, 2.25, 2.4],
    rotationY: HALF_PI,
    size: [0.32, 0.32, 0.05],
  },

  // Luminárias pendentes (a caixa vai da base do pendente até o teto)
  {
    id: 'pendantDesk',
    kind: 'ceiling',
    position: [-1.0, ROOM.height - 0.75, -0.9],
    rotationY: 0,
    size: [0.44, 0.75, 0.44],
  },
  {
    id: 'pendantLounge',
    kind: 'ceiling',
    position: [4.7, ROOM.height - 0.75, -0.6],
    rotationY: 0,
    size: [0.44, 0.75, 0.44],
  },
] as const satisfies readonly Placement[];

export type PlacementId = (typeof PLACEMENTS)[number]['id'];

export function findPlacement(id: PlacementId): Placement {
  const placement = PLACEMENTS.find((item) => item.id === id);
  if (!placement) throw new Error(`Posição desconhecida: ${id}`);
  return placement;
}

export interface Bounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly minY: number;
  readonly maxY: number;
}

/** Caixa alinhada aos eixos do mundo que envolve o item já rotacionado. */
export function placementBounds(placement: Placement): Bounds {
  const [width, height, depth] = placement.size;
  const [px, py, pz] = placement.position;
  const corners = [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2],
  ] as const;
  const rotated = corners.map(([x, z]) => rotateY(x, z, placement.rotationY));
  const xs = rotated.map(([x]) => px + x);
  const zs = rotated.map(([, z]) => pz + z);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
    minY: py,
    maxY: py + height,
  };
}

export function boundsOverlap(a: Bounds, b: Bounds, tolerance = 0.01): boolean {
  return (
    a.minX < b.maxX - tolerance &&
    a.maxX > b.minX + tolerance &&
    a.minZ < b.maxZ - tolerance &&
    a.maxZ > b.minZ + tolerance &&
    a.minY < b.maxY - tolerance &&
    a.maxY > b.minY + tolerance
  );
}

export function isInsideRoom(placement: Placement, room: RoomDimensions = ROOM): boolean {
  const b = placementBounds(placement);
  const epsilon = 1e-6;
  return (
    b.minX >= -room.width / 2 - epsilon &&
    b.maxX <= room.width / 2 + epsilon &&
    b.minZ >= -room.depth / 2 - epsilon &&
    b.maxZ <= room.depth / 2 + epsilon &&
    b.minY >= -epsilon &&
    b.maxY <= room.height + epsilon
  );
}

/** Verdadeiro se o ponto está dentro de algum móvel (útil para validar a câmera). */
export function pointInsideFurniture(point: Vec3): boolean {
  const [x, y, z] = point;
  return PLACEMENTS.filter((p) => p.kind === 'furniture').some((p) => {
    const b = placementBounds(p);
    return x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ && y > b.minY && y < b.maxY;
  });
}
