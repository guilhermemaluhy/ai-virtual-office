/** Configurações gerais da aplicação (sem segredos: tudo aqui vai para o navegador). */
export const APP_NAME = 'Novera Virtual Office';
export const APP_VERSION = '0.1.0';

export interface RenderConfig {
  /** Faixa de densidade de pixels: limita o custo em telas de alta densidade. */
  readonly dpr: readonly [min: number, max: number];
  /**
   * `always` desde a Etapa 3: o personagem tem animação contínua (respiração, digitação).
   * O navegador pausa o loop quando a aba fica oculta.
   */
  readonly frameloop: 'always' | 'demand';
  readonly shadowMapSize: number;
  readonly antialias: boolean;
  /** Exposição do tone mapping (ACES). */
  readonly exposure: number;
}

export const RENDER_CONFIG: RenderConfig = {
  dpr: [1, 1.75],
  frameloop: 'always',
  shadowMapSize: 2048,
  antialias: true,
  exposure: 1.0,
};

/** `?stats` na URL liga o medidor de FPS e o registro de draw calls no console. */
export function isStatsEnabled(search: string = window.location.search): boolean {
  return new URLSearchParams(search).has('stats');
}
