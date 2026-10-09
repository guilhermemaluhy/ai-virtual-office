export type Vec3 = readonly [x: number, y: number, z: number];

export const DEG = Math.PI / 180;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Gerador pseudoaleatório determinístico (mulberry32). A mesma semente produz
 * sempre a mesma sequência: texturas e objetos procedurais não mudam entre recargas.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rotaciona um ponto (x, z) em torno do eixo Y, seguindo a convenção do Three.js. */
export function rotateY(x: number, z: number, angle: number): readonly [x: number, z: number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, -x * sin + z * cos];
}
