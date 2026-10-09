import { describe, expect, it } from 'vitest';
import { createProceduralTextures } from './textures.js';

describe('createProceduralTextures', () => {
  it('devolve null (fallback para cores chapadas) quando não há Canvas 2D', () => {
    // jsdom não implementa getContext('2d') sem o pacote `canvas`.
    expect(createProceduralTextures(1)).toBeNull();
  });

  it('devolve null quando a criação do canvas falha', () => {
    expect(
      createProceduralTextures(1, () => {
        throw new Error('sem canvas');
      }),
    ).toBeNull();
  });
});
