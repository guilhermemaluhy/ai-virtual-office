import { describe, expect, it } from 'vitest';
import { curtainWallPanes, CURTAIN_WALL } from '../config/office.js';
import {
  AGENT_VIEW,
  INITIAL_VIEW,
  isInsideBounds,
  roomCameraBounds,
} from './camera/cameraPresets.js';
import {
  boundsOverlap,
  findPlacement,
  isInsideRoom,
  placementBounds,
  PLACEMENTS,
  pointInsideFurniture,
  type Placement,
} from './layout.js';

describe('layout do escritório', () => {
  it('todos os itens ficam dentro da sala', () => {
    for (const placement of PLACEMENTS) {
      expect(isInsideRoom(placement), placement.id).toBe(true);
    }
  });

  it('móveis não se sobrepõem (salvo pares permitidos)', () => {
    const furniture: readonly Placement[] = PLACEMENTS.filter((p) => p.kind === 'furniture');
    for (const a of furniture) {
      for (const b of furniture) {
        if (a.id >= b.id) continue;
        if (a.allowOverlap?.includes(b.id) || b.allowOverlap?.includes(a.id)) continue;
        expect(boundsOverlap(placementBounds(a), placementBounds(b)), `${a.id} × ${b.id}`).toBe(
          false,
        );
      }
    }
  });

  it('ids são únicos', () => {
    const ids = PLACEMENTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a cadeira fica encostada na mesa, voltada para ela, com o assento parcialmente sob o tampo', () => {
    const desk = placementBounds(findPlacement('desk'));
    const chair = placementBounds(findPlacement('chair'));
    const tuck = chair.maxX - desk.minX;
    expect(tuck).toBeGreaterThan(0.05);
    expect(tuck).toBeLessThan(0.2);
    expect(findPlacement('chair').rotationY).toBe(findPlacement('desk').rotationY);
  });

  it('as visões de câmera não nascem dentro de um móvel nem fora da sala', () => {
    const bounds = roomCameraBounds();
    for (const view of [INITIAL_VIEW, AGENT_VIEW]) {
      expect(pointInsideFurniture(view.position)).toBe(false);
      expect(isInsideBounds(view.position, bounds)).toBe(true);
      expect(isInsideBounds(view.target, bounds)).toBe(true);
    }
  });

  it('calcula a caixa envolvente considerando a rotação', () => {
    const rotated: Placement = {
      id: 'x',
      kind: 'furniture',
      position: [0, 0, 0],
      rotationY: Math.PI / 2,
      size: [2, 1, 0.5],
    };
    const b = placementBounds(rotated);
    expect(b.maxX - b.minX).toBeCloseTo(0.5);
    expect(b.maxZ - b.minZ).toBeCloseTo(2);
  });
});

describe('fachada envidraçada', () => {
  it('divide o vão em painéis iguais que, somados aos montantes, fecham o vão', () => {
    const panes = curtainWallPanes();
    expect(panes).toHaveLength(CURTAIN_WALL.panes);
    const glass = panes.reduce((sum, p) => sum + p.width, 0);
    expect(glass + CURTAIN_WALL.mullion * (CURTAIN_WALL.panes + 1)).toBeCloseTo(CURTAIN_WALL.span);
    const first = panes[0]!;
    expect(first.x - first.width / 2).toBeCloseTo(-CURTAIN_WALL.span / 2 + CURTAIN_WALL.mullion);
  });
});
