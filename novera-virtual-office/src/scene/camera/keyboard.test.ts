import { describe, expect, it } from 'vitest';
import { isTypingTarget, keyToCameraAction } from './keyboard.js';

describe('keyToCameraAction', () => {
  it('mapeia WASD e setas para movimento', () => {
    expect(keyToCameraAction('w')).toEqual({ kind: 'forward', distance: expect.any(Number) });
    expect(keyToCameraAction('ArrowDown')?.kind).toBe('forward');
    expect(keyToCameraAction('a')).toMatchObject({ kind: 'truck' });
    expect(keyToCameraAction('ArrowRight')).toMatchObject({ kind: 'truck' });
  });

  it('W e S têm sentidos opostos', () => {
    const forward = keyToCameraAction('W');
    const back = keyToCameraAction('s');
    expect(
      forward?.kind === 'forward' &&
        back?.kind === 'forward' &&
        forward.distance === -back.distance,
    ).toBe(true);
  });

  it('Q/E giram, +/- aproximam, R e Home voltam à visão inicial', () => {
    expect(keyToCameraAction('q')?.kind).toBe('rotate');
    expect(keyToCameraAction('e')?.kind).toBe('rotate');
    expect(keyToCameraAction('+')?.kind).toBe('dolly');
    expect(keyToCameraAction('-')?.kind).toBe('dolly');
    expect(keyToCameraAction('r')).toEqual({ kind: 'reset' });
    expect(keyToCameraAction('Home')).toEqual({ kind: 'reset' });
  });

  it('ignora teclas sem função', () => {
    expect(keyToCameraAction('x')).toBeNull();
    expect(keyToCameraAction('Enter')).toBeNull();
  });
});

describe('isTypingTarget', () => {
  it('reconhece campos de texto', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
