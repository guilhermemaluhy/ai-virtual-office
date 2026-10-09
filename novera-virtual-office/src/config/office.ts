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
