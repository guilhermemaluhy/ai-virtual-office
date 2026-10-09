import { describe, expect, it } from 'vitest';
import { ROOM } from '../../config/office.js';
import { CAMERA_LIMITS, INITIAL_VIEW, isInsideBounds, roomCameraBounds } from './cameraPresets.js';

describe('limites da câmera', () => {
  const bounds = roomCameraBounds();

  it('ficam dentro da sala, com folga para as paredes e o teto', () => {
    expect(bounds.min[0]).toBeGreaterThan(-ROOM.width / 2);
    expect(bounds.max[0]).toBeLessThan(ROOM.width / 2);
    expect(bounds.min[2]).toBeGreaterThan(-ROOM.depth / 2);
    expect(bounds.max[2]).toBeLessThan(ROOM.depth / 2);
    expect(bounds.max[1]).toBeLessThan(ROOM.height);
    expect(bounds.min[1]).toBeGreaterThan(0);
  });

  it('a visão inicial (câmera e alvo) está dentro dos limites', () => {
    expect(isInsideBounds(INITIAL_VIEW.position, bounds)).toBe(true);
    expect(isInsideBounds(INITIAL_VIEW.target, bounds)).toBe(true);
  });

  it('a distância inicial respeita o zoom mínimo e máximo', () => {
    const [px, py, pz] = INITIAL_VIEW.position;
    const [tx, ty, tz] = INITIAL_VIEW.target;
    const distance = Math.hypot(px - tx, py - ty, pz - tz);
    expect(distance).toBeGreaterThanOrEqual(CAMERA_LIMITS.minDistance);
    expect(distance).toBeLessThanOrEqual(CAMERA_LIMITS.maxDistance);
  });

  it('rejeita pontos fora da sala', () => {
    expect(isInsideBounds([ROOM.width, 1, 0], bounds)).toBe(false);
    expect(isInsideBounds([0, -1, 0], bounds)).toBe(false);
  });
});
