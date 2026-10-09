import {
  BackSide,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Material,
  type Texture,
} from 'three';
import { ROOM } from '../../config/office.js';
import {
  createProceduralTextures,
  FLOOR_TILE_METERS,
  type ProceduralTextures,
} from './textures.js';

/** Materiais compartilhados por toda a cena: uma instância por acabamento. */
export interface OfficeMaterials {
  readonly floor: MeshStandardMaterial;
  readonly wall: MeshStandardMaterial;
  readonly ceiling: MeshStandardMaterial;
  readonly trim: MeshStandardMaterial; // rodapés, guarnições, laminado branco
  readonly oak: MeshStandardMaterial; // tampo da mesa
  readonly walnut: MeshStandardMaterial; // móveis escuros
  readonly darkMetal: MeshStandardMaterial;
  readonly chrome: MeshStandardMaterial;
  readonly blackPlastic: MeshStandardMaterial;
  readonly greyPlastic: MeshStandardMaterial;
  readonly fabricDark: MeshStandardMaterial; // cadeira
  readonly fabricAccent: MeshStandardMaterial; // sofá
  readonly cushion: MeshStandardMaterial;
  readonly rug: MeshStandardMaterial;
  readonly glass: MeshPhysicalMaterial;
  readonly leaf: MeshStandardMaterial;
  readonly ceramic: MeshStandardMaterial;
  readonly ceramicDark: MeshStandardMaterial;
  readonly paper: MeshStandardMaterial;
  readonly accent: MeshStandardMaterial;
  readonly lightPanel: MeshStandardMaterial;
  readonly bulb: MeshStandardMaterial;
  readonly screen: MeshStandardMaterial;
  readonly sky: MeshBasicMaterial;
  readonly concrete: MeshStandardMaterial;
  readonly asphalt: MeshStandardMaterial;
  readonly building: MeshStandardMaterial;
  readonly treeCanopy: MeshStandardMaterial;
  readonly bark: MeshStandardMaterial;
  readonly art: readonly [MeshStandardMaterial, MeshStandardMaterial];
  readonly textures: ProceduralTextures | null;
  dispose(): void;
}

function repeat(texture: Texture, x: number, y: number): Texture {
  texture.repeat.set(x, y);
  return texture;
}

function cloneRepeat(texture: Texture, x: number, y: number): Texture {
  const copy = texture.clone();
  copy.repeat.set(x, y);
  copy.needsUpdate = true;
  return copy;
}

export function createOfficeMaterials(anisotropy: number): OfficeMaterials {
  const textures = createProceduralTextures(anisotropy);
  const extraTextures: Texture[] = [];
  const withRepeat = (texture: Texture | undefined, x: number, y: number) => {
    if (!texture) return null;
    const copy = cloneRepeat(texture, x, y);
    extraTextures.push(copy);
    return copy;
  };

  const floor = new MeshStandardMaterial({
    color: textures ? '#ffffff' : '#9b7553',
    roughness: 0.6,
    envMapIntensity: 0.55,
  });
  if (textures) {
    const rx = ROOM.width / FLOOR_TILE_METERS;
    const ry = ROOM.depth / FLOOR_TILE_METERS;
    floor.map = repeat(textures.floor.map, rx, ry);
    floor.bumpMap = repeat(textures.floor.bumpMap, rx, ry);
    floor.bumpScale = 0.6;
    floor.roughnessMap = repeat(textures.floor.roughnessMap, rx, ry);
  }

  const wall = new MeshStandardMaterial({ color: '#e4dfd6', roughness: 0.95 });
  // O forro só recebe luz indireta; uma emissão fraca simula a luz rebatida das luminárias.
  const ceiling = new MeshStandardMaterial({
    color: '#f1efea',
    roughness: 1,
    emissive: '#e9e5de',
    emissiveIntensity: 0.16,
  });
  if (textures) {
    wall.map = repeat(textures.plaster, 4, 1.2);
    wall.bumpMap = textures.plaster;
    wall.bumpScale = 0.15;
    ceiling.map = withRepeat(textures.plaster, 4, 3);
  }

  const woodMap = textures?.woodGrain ?? null;
  const oak = new MeshStandardMaterial({
    color: textures ? '#c9a071' : '#b98a5c',
    roughness: 0.5,
    envMapIntensity: 0.7,
    map: woodMap,
  });
  const walnut = new MeshStandardMaterial({
    color: textures ? '#7a4e33' : '#6b452d',
    roughness: 0.48,
    envMapIntensity: 0.7,
    map: withRepeat(woodMap ?? undefined, 2, 2),
  });

  const fabricMap = textures?.fabric ?? null;
  const fabricDark = new MeshStandardMaterial({
    color: '#39424e',
    roughness: 0.95,
    map: withRepeat(fabricMap ?? undefined, 6, 6),
  });
  const fabricAccent = new MeshStandardMaterial({
    color: '#53707f',
    roughness: 0.95,
    map: withRepeat(fabricMap ?? undefined, 8, 8),
  });
  const cushion = new MeshStandardMaterial({
    color: '#c89b6d',
    roughness: 0.95,
    map: withRepeat(fabricMap ?? undefined, 4, 4),
  });
  const rug = new MeshStandardMaterial({
    color: '#8f877a',
    roughness: 1,
    map: withRepeat(fabricMap ?? undefined, 24, 24),
  });

  const screen = new MeshStandardMaterial({
    color: '#000000',
    roughness: 0.25,
    emissive: '#ffffff',
    emissiveIntensity: textures ? 1.0 : 0.3,
    emissiveMap: textures?.screen ?? null,
  });
  if (!textures) screen.emissive.set('#1b2a44');

  const sky = new MeshBasicMaterial({
    color: textures ? '#ffffff' : '#9cc0e8',
    map: textures?.sky ?? null,
    side: BackSide,
    fog: false,
  });

  const art0 = new MeshStandardMaterial({
    color: textures ? '#ffffff' : '#5fa8d3',
    roughness: 0.85,
    map: textures?.art[0] ?? null,
  });
  const art1 = new MeshStandardMaterial({
    color: textures ? '#ffffff' : '#c89b6d',
    roughness: 0.85,
    map: textures?.art[1] ?? null,
  });

  const materials: OfficeMaterials = {
    floor,
    wall,
    ceiling,
    trim: new MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.7 }),
    oak,
    walnut,
    darkMetal: new MeshStandardMaterial({ color: '#2b2e33', metalness: 0.7, roughness: 0.42 }),
    chrome: new MeshStandardMaterial({ color: '#d7d9dc', metalness: 1, roughness: 0.2 }),
    blackPlastic: new MeshStandardMaterial({ color: '#1b1c1f', roughness: 0.55 }),
    greyPlastic: new MeshStandardMaterial({ color: '#3b3e44', roughness: 0.6 }),
    fabricDark,
    fabricAccent,
    cushion,
    rug,
    glass: new MeshPhysicalMaterial({
      color: '#d9ecfb',
      transparent: true,
      opacity: 0.16,
      roughness: 0.04,
      metalness: 0,
      envMapIntensity: 1.3,
      side: DoubleSide,
      depthWrite: false,
    }),
    leaf: new MeshStandardMaterial({ color: '#3f7a3b', roughness: 0.7, side: DoubleSide }),
    ceramic: new MeshStandardMaterial({ color: '#d8d2c6', roughness: 0.35 }),
    ceramicDark: new MeshStandardMaterial({ color: '#3a3f45', roughness: 0.4 }),
    paper: new MeshStandardMaterial({ color: '#f4f2ed', roughness: 0.9 }),
    accent: new MeshStandardMaterial({ color: '#1f2d3d', roughness: 0.6 }),
    lightPanel: new MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#fff3e2',
      emissiveIntensity: 2.2,
    }),
    bulb: new MeshStandardMaterial({ color: '#ffffff', emissive: '#ffe2b8', emissiveIntensity: 4 }),
    screen,
    sky,
    concrete: new MeshStandardMaterial({ color: '#a3a39f', roughness: 0.95 }),
    asphalt: new MeshStandardMaterial({ color: '#4d5156', roughness: 1 }),
    building: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.7, metalness: 0.1 }),
    treeCanopy: new MeshStandardMaterial({ color: '#4c7a3f', roughness: 0.9 }),
    bark: new MeshStandardMaterial({ color: '#5b4634', roughness: 0.95 }),
    art: [art0, art1],
    textures,
    dispose() {
      const list = Object.values(materials).filter(
        (value): value is Material =>
          value instanceof Object && 'dispose' in value && value !== materials,
      );
      list.forEach((material) => material.dispose());
      art0.dispose();
      art1.dispose();
      textures?.all.forEach((texture) => texture.dispose());
      extraTextures.forEach((texture) => texture.dispose());
    },
  };
  return materials;
}
