import type { AgentRole, Marketplace } from '@aivo/shared';

export type Vec3 = readonly [x: number, y: number, z: number];

export interface Rect {
  x: [min: number, max: number];
  z: [min: number, max: number];
}

/** Office floor plan, in meters. +x right, +z toward the camera. */
export const FLOOR_PLAN = {
  bounds: { x: [-16, 16], z: [-11, 9] } satisfies Rect,
  ceoRoom: { x: [-16, 16], z: [-11, -5] } satisfies Rect,
  wings: {
    mercado_livre: { x: [-16, -5], z: [-5, 9] },
    shopee: { x: [5, 16], z: [-5, 9] },
  } satisfies Record<Marketplace, Rect>,
  meetingRoom: { x: [-5, 5], z: [-5, 2] } satisfies Rect,
  stockRoom: { x: [-5, 5], z: [2, 9] } satisfies Rect,
} as const;

export const CEO_DESK: Vec3 = [-3, 0, -8.2];
export const APPROVAL_BOARD: Vec3 = [5.5, 0, -10.85];
export const MEETING_TABLE: Vec3 = [0, 0, -1.6];
export const MEETING_TABLE_RADIUS = 1.9;

export interface DeskSpot {
  /** Where the desk stands. The agent sits just behind it (−z), facing the camera. */
  desk: Vec3;
  seat: Vec3;
  large: boolean;
}

/** Desk slots inside the Mercado Livre wing; the Shopee wing mirrors them on x. */
const WING_SLOTS: Record<Exclude<AgentRole, 'comprador'>, { x: number; z: number }> = {
  diretor: { x: -10.5, z: -2.6 },
  estrategista: { x: -10.5, z: 0.4 },
  cadastro: { x: -13.2, z: 3.2 },
  ads: { x: -7.8, z: 3.2 },
  afiliados: { x: -13.2, z: 5.6 },
  campanhas: { x: -7.8, z: 5.6 },
  atendimento: { x: -10.5, z: 8 },
};

const COMPRADOR_SLOT = { x: 0, z: 5.6 };
const SEAT_OFFSET = 0.85;

function spotAt(x: number, z: number, large: boolean): DeskSpot {
  return { desk: [x, 0, z], seat: [x, 0, z - SEAT_OFFSET], large };
}

export function deskFor(role: AgentRole, marketplace: Marketplace | null): DeskSpot {
  if (role === 'comprador') return spotAt(COMPRADOR_SLOT.x, COMPRADOR_SLOT.z, false);
  if (!marketplace) throw new Error(`Role "${role}" needs a marketplace`);
  const slot = WING_SLOTS[role];
  const x = marketplace === 'shopee' ? -slot.x : slot.x;
  return spotAt(x, slot.z, role === 'diretor');
}

/** Evenly spaced seats around the meeting table for `count` attendees. */
export function meetingSeats(count: number): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2;
    return [
      MEETING_TABLE[0] + Math.cos(angle) * (MEETING_TABLE_RADIUS + 0.55),
      0,
      MEETING_TABLE[2] + Math.sin(angle) * (MEETING_TABLE_RADIUS + 0.55),
    ] as const;
  });
}

export const inside = (rect: Rect, [x, , z]: Vec3) =>
  x >= rect.x[0] && x <= rect.x[1] && z >= rect.z[0] && z <= rect.z[1];
