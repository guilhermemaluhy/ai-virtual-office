import type { Vec3 } from '../../lib/math.js';

/**
 * Pose de alto nível do personagem. É o contrato entre o rig (que decide a pose a partir
 * do estado) e o modelo (que a aplica aos ossos/malhas). Trocar o modelo por um glTF
 * significa implementar `CharacterHandle` de novo, sem mexer no rig nem no estado.
 */
export interface Pose {
  /** 0..1, expansão do peito */
  breath: number;
  /** radianos; positivo inclina o tronco para a frente (em direção à mesa) */
  lean: number;
  /** radianos; positivo abaixa o olhar */
  headPitch: number;
  headYaw: number;
  headRoll: number;
  /** 0 olhos abertos .. 1 fechados */
  blink: number;
  /** posição-alvo das mãos no espaço do tronco (origem na cintura, +Z para a frente) */
  leftHand: Vec3;
  rightHand: Vec3;
  /** 0..1 intensidade da digitação; `typingSpeed` em toques por segundo */
  typing: number;
  typingSpeed: number;
}

export interface CharacterHandle {
  applyPose(pose: Pose, time: number): void;
}
