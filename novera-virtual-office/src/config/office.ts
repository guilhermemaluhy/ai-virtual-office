/** Dimensões do escritório em metros (1 unidade = 1 m). Origem no centro do piso. */
export interface RoomDimensions {
  readonly width: number; // eixo X
  readonly depth: number; // eixo Z
  readonly height: number; // eixo Y
  readonly wallThickness: number;
}

export const ROOM: RoomDimensions = {
  width: 12,
  depth: 9,
  height: 3.2,
  wallThickness: 0.2,
};

/** Fachada envidraçada na parede do fundo (Z negativo). */
export interface CurtainWallConfig {
  readonly sill: number; // altura do peitoril
  readonly head: number; // altura do topo do vidro
  readonly span: number; // largura total envidraçada
  readonly panes: number; // número de painéis de vidro
  readonly mullion: number; // espessura dos montantes
  readonly transom: number; // altura da travessa horizontal
}

export const CURTAIN_WALL: CurtainWallConfig = {
  sill: 0.55,
  head: 2.95,
  span: 10.4,
  panes: 4,
  mullion: 0.09,
  transom: 1.55,
};

export interface Pane {
  readonly x: number; // centro do painel
  readonly width: number;
}

/** Divide a fachada em painéis iguais, descontando os montantes entre eles. */
export function curtainWallPanes(config: CurtainWallConfig = CURTAIN_WALL): readonly Pane[] {
  const glassWidth = (config.span - config.mullion * (config.panes + 1)) / config.panes;
  const panes: Pane[] = [];
  let x = -config.span / 2 + config.mullion;
  for (let i = 0; i < config.panes; i += 1) {
    panes.push({ x: x + glassWidth / 2, width: glassWidth });
    x += glassWidth + config.mullion;
  }
  return panes;
}
