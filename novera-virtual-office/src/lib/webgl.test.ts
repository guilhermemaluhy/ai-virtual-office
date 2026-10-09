import { describe, expect, it } from 'vitest';
import { supportsWebGL2 } from './webgl.js';

describe('supportsWebGL2', () => {
  it('retorna false quando não há contexto WebGL 2 (como no jsdom)', () => {
    expect(supportsWebGL2()).toBe(false);
  });

  it('retorna false quando a criação do canvas lança erro', () => {
    expect(
      supportsWebGL2(() => {
        throw new Error('sem canvas');
      }),
    ).toBe(false);
  });

  it('retorna true quando o contexto existe', () => {
    const fake = {
      getContext: () => ({ getExtension: () => null }),
    } as unknown as HTMLCanvasElement;
    expect(supportsWebGL2(() => fake)).toBe(true);
  });
});
