/**
 * Pintores de texturas procedurais em Canvas 2D. Não dependem de Three.js nem de React:
 * recebem um contexto e desenham. Toda aleatoriedade vem de `rng` (determinística).
 */
import { lerp } from '../../lib/math.js';

export type Painter = CanvasRenderingContext2D;
export type Rng = () => number;

export interface Plank {
  readonly row: number;
  readonly x0: number; // início (pode ultrapassar `size`: o excedente volta pelo lado esquerdo)
  readonly length: number;
  readonly tone: number; // 0..1, variação de cor da tábua
}

export interface PlankLayout {
  readonly rows: number;
  readonly size: number;
  readonly planks: readonly Plank[];
}

/**
 * Gera tábuas cujos comprimentos, em cada fileira, somam exatamente `size`,
 * com deslocamento aleatório: a textura repete sem emendas e sem juntas alinhadas.
 */
export function generatePlankLayout(rng: Rng, rows: number, size: number): PlankLayout {
  const planks: Plank[] = [];
  for (let row = 0; row < rows; row += 1) {
    const count = 2 + Math.floor(rng() * 2); // 2 ou 3 tábuas por fileira
    const weights = Array.from({ length: count }, () => 0.6 + rng() * 0.8);
    const total = weights.reduce((sum, w) => sum + w, 0);
    let x = rng() * size;
    for (const weight of weights) {
      const length = (weight / total) * size;
      planks.push({ row, x0: x % size, length, tone: rng() });
      x += length;
    }
  }
  return { rows, size, planks };
}

function forEachPlankRect(
  layout: PlankLayout,
  draw: (x: number, y: number, w: number, h: number, plank: Plank) => void,
) {
  const rowHeight = layout.size / layout.rows;
  for (const plank of layout.planks) {
    const y = plank.row * rowHeight;
    draw(plank.x0, y, plank.length, rowHeight, plank);
    if (plank.x0 + plank.length > layout.size) {
      draw(plank.x0 - layout.size, y, plank.length, rowHeight, plank); // parte que "dá a volta"
    }
  }
}

/** Mapa de cor do piso de madeira: tábuas com tons variados, veios e juntas escuras. */
export function paintWoodPlanks(ctx: Painter, layout: PlankLayout, rng: Rng): void {
  const { size } = layout;
  ctx.fillStyle = '#9a6d47';
  ctx.fillRect(0, 0, size, size);
  forEachPlankRect(layout, (x, y, w, h, plank) => {
    const light = lerp(36, 50, plank.tone);
    const hue = lerp(22, 30, rng());
    ctx.fillStyle = `hsl(${hue.toFixed(1)} 42% ${light.toFixed(1)}%)`;
    ctx.fillRect(x, y, w, h);

    // veios: linhas longas e levemente onduladas
    const grainLines = 10 + Math.floor(rng() * 8);
    ctx.lineWidth = 1;
    for (let i = 0; i < grainLines; i += 1) {
      const yy = y + (i + 0.5) * (h / grainLines) + (rng() - 0.5) * 2;
      const alpha = 0.05 + rng() * 0.12;
      ctx.strokeStyle = `rgba(55, 32, 14, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      const wobble = 1 + rng() * 2;
      const phase = rng() * Math.PI * 2;
      for (let px = 0; px <= w; px += 8) {
        const py = yy + Math.sin(px * 0.02 + phase) * wobble;
        if (px === 0) ctx.moveTo(x + px, py);
        else ctx.lineTo(x + px, py);
      }
      ctx.stroke();
    }

    // juntas entre tábuas
    ctx.fillStyle = 'rgba(40, 22, 10, 0.55)';
    ctx.fillRect(x, y, w, 1.5);
    ctx.fillRect(x, y, 1.5, h);
  });
}

/** Mapa de relevo (bump) do piso: cinza médio com juntas afundadas e ruído fino. */
export function paintPlankBump(ctx: Painter, layout: PlankLayout, rng: Rng): void {
  const { size } = layout;
  ctx.fillStyle = 'rgb(128, 128, 128)';
  ctx.fillRect(0, 0, size, size);
  addNoise(ctx, size, size, rng, 8);
  forEachPlankRect(layout, (x, y, w, h) => {
    ctx.fillStyle = 'rgb(60, 60, 60)';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y, 2, h);
  });
}

/** Mapa de rugosidade do piso: cada tábua um pouco mais ou menos fosca. */
export function paintPlankRoughness(ctx: Painter, layout: PlankLayout): void {
  const { size } = layout;
  ctx.fillStyle = 'rgb(150, 150, 150)';
  ctx.fillRect(0, 0, size, size);
  forEachPlankRect(layout, (x, y, w, h, plank) => {
    const value = Math.round(lerp(130, 175, plank.tone));
    ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.fillRect(x, y, w, h);
  });
}

/** Ruído por pixel somado ao conteúdo atual (amplitude em níveis de 0–255). */
export function addNoise(
  ctx: Painter,
  width: number,
  height: number,
  rng: Rng,
  amplitude: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (rng() - 0.5) * 2 * amplitude;
    data[i] = clampByte(data[i]! + n);
    data[i + 1] = clampByte(data[i + 1]! + n);
    data[i + 2] = clampByte(data[i + 2]! + n);
  }
  ctx.putImageData(image, 0, 0);
}

function clampByte(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : Math.round(value);
}

/** Reboco: quase branco com ruído fino (a cor final vem do material). */
export function paintPlaster(ctx: Painter, size: number, rng: Rng): void {
  ctx.fillStyle = 'rgb(238, 238, 238)';
  ctx.fillRect(0, 0, size, size);
  addNoise(ctx, size, size, rng, 9);
}

/** Tecido: trama fina em xadrez de 2 px com ruído. */
export function paintFabric(ctx: Painter, size: number, rng: Rng): void {
  const image = ctx.createImageData(size, size);
  const data = image.data;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const weave = ((x >> 1) + (y >> 1)) & 1 ? 205 : 178;
      const value = clampByte(weave + (rng() - 0.5) * 24);
      const i = (y * size + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

/** Veios de madeira para móveis: fundo claro com linhas onduladas (o material tinge). */
export function paintWoodGrain(ctx: Painter, size: number, rng: Rng): void {
  const gradient = ctx.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, 'rgb(236, 224, 208)');
  gradient.addColorStop(1, 'rgb(226, 212, 194)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const lines = 46;
  for (let i = 0; i < lines; i += 1) {
    const y = (i + 0.5) * (size / lines) + (rng() - 0.5) * 6;
    ctx.lineWidth = 1 + rng() * 2.2;
    ctx.strokeStyle = `rgba(120, 82, 48, ${(0.07 + rng() * 0.16).toFixed(3)})`;
    ctx.beginPath();
    const amplitude = 2 + rng() * 5;
    const frequency = 0.01 + rng() * 0.02;
    const phase = rng() * Math.PI * 2;
    for (let x = 0; x <= size; x += 6) {
      const yy = y + Math.sin(x * frequency + phase) * amplitude;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  addNoise(ctx, size, size, rng, 4);
}

/** Céu para a esfera externa (equirretangular: topo = zênite, meio = horizonte). */
export function paintSky(ctx: Painter, width: number, height: number, rng: Rng): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#2f6fc4');
  gradient.addColorStop(0.3, '#6ea5e3');
  gradient.addColorStop(0.48, '#c6dcf0');
  gradient.addColorStop(0.5, '#dfe7ee');
  gradient.addColorStop(1, '#c7d3df');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // nuvens suaves acima do horizonte
  for (let i = 0; i < 26; i += 1) {
    const x = rng() * width;
    const y = height * (0.2 + rng() * 0.24);
    const rx = 30 + rng() * 90;
    const ry = 6 + rng() * 14;
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.18 + rng() * 0.3).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Área de trabalho exibida no monitor: janela com texto fictício e painel com gráfico. */
export function paintScreen(ctx: Painter, width: number, height: number, rng: Rng): void {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#13203a');
  bg.addColorStop(1, '#0b1322');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // janela principal
  const wx = width * 0.05;
  const wy = height * 0.1;
  const ww = width * 0.58;
  const wh = height * 0.76;
  ctx.fillStyle = '#1b2433';
  ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#273243';
  ctx.fillRect(wx, wy, ww, height * 0.07);
  ['#e5675f', '#e0b354', '#4cc38a'].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(wx + 12 + i * 14, wy + height * 0.035, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  const lineHeight = height * 0.045;
  for (let i = 0; i < 13; i += 1) {
    const y = wy + height * 0.1 + i * lineHeight;
    const indent = (i % 4) * 14;
    ctx.fillStyle = i % 5 === 0 ? '#5fa8d3' : i % 3 === 0 ? '#c9d1d9' : '#8b949e';
    ctx.fillRect(wx + 14 + indent, y, ww * (0.25 + rng() * 0.55) - indent, lineHeight * 0.45);
  }

  // painel lateral com gráfico de barras
  const px = width * 0.66;
  const pw = width * 0.29;
  ctx.fillStyle = '#1b2433';
  ctx.fillRect(px, wy, pw, wh);
  ctx.fillStyle = '#c9d1d9';
  ctx.fillRect(px + 12, wy + 12, pw * 0.5, 6);
  const bars = 7;
  const barWidth = (pw - 24) / bars;
  for (let i = 0; i < bars; i += 1) {
    const h = wh * (0.2 + rng() * 0.5);
    ctx.fillStyle = i === bars - 1 ? '#5fa8d3' : '#2f4f6b';
    ctx.fillRect(px + 12 + i * barWidth + 2, wy + wh - 16 - h, barWidth - 4, h);
  }

  // barra de tarefas
  ctx.fillStyle = '#0a111c';
  ctx.fillRect(0, height * 0.92, width, height * 0.08);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i === 1 ? '#5fa8d3' : '#2b3646';
    ctx.fillRect(10 + i * 22, height * 0.94, 14, height * 0.04);
  }
}

/** Quadro abstrato para as paredes: formas translúcidas na paleta do escritório. */
export function paintAbstractArt(
  ctx: Painter,
  width: number,
  height: number,
  rng: Rng,
  palette: readonly string[],
): void {
  ctx.fillStyle = '#efe9e0';
  ctx.fillRect(0, 0, width, height);
  const shapes = 6 + Math.floor(rng() * 4);
  for (let i = 0; i < shapes; i += 1) {
    ctx.fillStyle = palette[Math.floor(rng() * palette.length)] ?? '#000';
    ctx.globalAlpha = 0.55 + rng() * 0.4;
    const x = rng() * width;
    const y = rng() * height;
    const w = width * (0.15 + rng() * 0.45);
    const h = height * (0.15 + rng() * 0.45);
    if (rng() < 0.5) {
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
    } else {
      ctx.beginPath();
      ctx.ellipse(x, y, w / 2, h / 2, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(20, 20, 20, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * rng(), 0);
  ctx.lineTo(width * rng(), height);
  ctx.stroke();
}
