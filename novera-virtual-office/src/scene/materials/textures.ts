import { BackSide, CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
import { createRandom } from '../../lib/math.js';
import {
  generatePlankLayout,
  paintAbstractArt,
  paintFabric,
  paintPlankBump,
  paintPlankRoughness,
  paintPlaster,
  paintScreen,
  paintSky,
  paintWoodGrain,
  paintWoodPlanks,
  type Painter,
} from './painters.js';

export { BackSide };

export interface FloorTextures {
  readonly map: Texture;
  readonly bumpMap: Texture;
  readonly roughnessMap: Texture;
}

export interface ProceduralTextures {
  readonly floor: FloorTextures;
  readonly plaster: Texture;
  readonly fabric: Texture;
  readonly woodGrain: Texture;
  readonly sky: Texture;
  readonly screen: Texture;
  readonly art: readonly [Texture, Texture];
  readonly all: readonly Texture[];
}

export type CanvasFactory = (width: number, height: number) => HTMLCanvasElement;

const defaultCanvasFactory: CanvasFactory = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/** Metros cobertos por uma repetição da textura do piso. */
export const FLOOR_TILE_METERS = 2.4;
export const ART_PALETTE = ['#1f2d3d', '#5fa8d3', '#c89b6d', '#e0b354', '#3b4756'] as const;

interface PaintedTexture {
  readonly texture: CanvasTexture;
}

function paint(
  createCanvas: CanvasFactory,
  width: number,
  height: number,
  color: boolean,
  anisotropy: number,
  painter: (ctx: Painter) => void,
): PaintedTexture | null {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  painter(ctx);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = anisotropy;
  if (color) texture.colorSpace = SRGBColorSpace;
  return { texture };
}

/**
 * Gera todas as texturas procedurais. Retorna `null` se o Canvas 2D não estiver
 * disponível; nesse caso os materiais usam cores chapadas (a cena continua funcionando).
 */
export function createProceduralTextures(
  anisotropy = 1,
  createCanvas: CanvasFactory = defaultCanvasFactory,
): ProceduralTextures | null {
  try {
    const floorLayout = generatePlankLayout(createRandom(7), 15, 1024);
    const items = {
      floorMap: paint(createCanvas, 1024, 1024, true, anisotropy, (ctx) =>
        paintWoodPlanks(ctx, floorLayout, createRandom(11)),
      ),
      floorBump: paint(createCanvas, 1024, 1024, false, anisotropy, (ctx) =>
        paintPlankBump(ctx, floorLayout, createRandom(12)),
      ),
      floorRough: paint(createCanvas, 1024, 1024, false, anisotropy, (ctx) =>
        paintPlankRoughness(ctx, floorLayout),
      ),
      plaster: paint(createCanvas, 512, 512, true, anisotropy, (ctx) =>
        paintPlaster(ctx, 512, createRandom(21)),
      ),
      fabric: paint(createCanvas, 256, 256, true, anisotropy, (ctx) =>
        paintFabric(ctx, 256, createRandom(31)),
      ),
      woodGrain: paint(createCanvas, 512, 512, true, anisotropy, (ctx) =>
        paintWoodGrain(ctx, 512, createRandom(41)),
      ),
      sky: paint(createCanvas, 1024, 512, true, 1, (ctx) =>
        paintSky(ctx, 1024, 512, createRandom(51)),
      ),
      screen: paint(createCanvas, 1024, 576, true, anisotropy, (ctx) =>
        paintScreen(ctx, 1024, 576, createRandom(61)),
      ),
      art0: paint(createCanvas, 512, 400, true, 1, (ctx) =>
        paintAbstractArt(ctx, 512, 400, createRandom(71), ART_PALETTE),
      ),
      art1: paint(createCanvas, 512, 340, true, 1, (ctx) =>
        paintAbstractArt(ctx, 512, 340, createRandom(72), ART_PALETTE),
      ),
    };
    const painted = Object.values(items);
    if (painted.some((item) => item === null)) {
      painted.forEach((item) => item?.texture.dispose());
      return null;
    }
    const t = items as { [K in keyof typeof items]: PaintedTexture };
    const all = painted.map((item) => (item as PaintedTexture).texture);
    return {
      floor: {
        map: t.floorMap.texture,
        bumpMap: t.floorBump.texture,
        roughnessMap: t.floorRough.texture,
      },
      plaster: t.plaster.texture,
      fabric: t.fabric.texture,
      woodGrain: t.woodGrain.texture,
      sky: t.sky.texture,
      screen: t.screen.texture,
      art: [t.art0.texture, t.art1.texture],
      all,
    };
  } catch (error) {
    console.warn('Texturas procedurais indisponíveis; usando cores chapadas.', error);
    return null;
  }
}
