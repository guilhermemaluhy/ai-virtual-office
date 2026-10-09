import type { AgentStatus } from '../../agent/agentState.js';
import { lerp, type Vec3 } from '../../lib/math.js';
import type { Pose } from './types.js';

/** Posições das mãos no espaço do tronco (origem na cintura, +Z para a frente, metros). */
export const HAND_REST: { readonly left: Vec3; readonly right: Vec3 } = {
  left: [-0.15, 0.11, 0.42],
  right: [0.15, 0.11, 0.42],
};
export const HAND_CHIN: Vec3 = [0.07, 0.46, 0.14];
export const HAND_RAISED: { readonly left: Vec3; readonly right: Vec3 } = {
  left: [-0.24, 0.2, 0.32],
  right: [0.24, 0.2, 0.32],
};

const BLINK_PERIOD = 4.1;
const BLINK_DURATION = 0.13;

function breathing(time: number, period: number): number {
  return 0.5 + 0.5 * Math.sin((time / period) * Math.PI * 2);
}

function blinking(time: number): number {
  return (time + 0.7) % BLINK_PERIOD < BLINK_DURATION ? 1 : 0;
}

/** Oscilação amortecida: aceno (sim) ou balanço (não) logo após a mudança de estado. */
function decayingSwing(
  sinceChange: number,
  amplitude: number,
  hertz: number,
  decay: number,
): number {
  if (sinceChange < 0) return 0;
  return amplitude * Math.sin(sinceChange * hertz * Math.PI * 2) * Math.exp(-sinceChange * decay);
}

export function restingPose(): Pose {
  return {
    breath: 0.5,
    lean: 0.02,
    headPitch: 0,
    headYaw: 0,
    headRoll: 0,
    blink: 0,
    leftHand: HAND_REST.left,
    rightHand: HAND_REST.right,
    typing: 0,
    typingSpeed: 0,
  };
}

/**
 * Pose-alvo para um estado em um instante. Puro e determinístico.
 * @param time segundos desde o início da cena
 * @param sinceChange segundos desde a última mudança de estado
 */
export function computePose(status: AgentStatus, time: number, sinceChange: number): Pose {
  const pose = restingPose();
  pose.blink = blinking(time);
  pose.breath = breathing(time, status === 'idle' || status === 'done' ? 4.2 : 3.2);

  switch (status) {
    case 'idle':
      pose.lean = 0.02;
      pose.headYaw = 0.08 * Math.sin(time * 0.5);
      pose.headPitch = 0.03 * Math.sin(time * 0.37);
      break;
    case 'working':
      pose.lean = 0.07;
      pose.headPitch = 0.1;
      pose.headYaw = 0.03 * Math.sin(time * 0.8);
      pose.typing = 1;
      pose.typingSpeed = 5.5;
      break;
    case 'executing':
      pose.lean = 0.09;
      pose.headPitch = 0.12;
      pose.typing = 1;
      pose.typingSpeed = 8.5;
      break;
    case 'thinking':
      pose.lean = -0.02;
      pose.headRoll = 0.14;
      pose.headPitch = -0.06;
      pose.headYaw = 0.12 + 0.03 * Math.sin(time * 0.6);
      pose.rightHand = HAND_CHIN;
      break;
    case 'done':
      pose.lean = -0.04;
      pose.headPitch = decayingSwing(sinceChange, 0.18, 1.2, 1.2);
      break;
    case 'error':
      pose.lean = -0.05;
      pose.headPitch = 0.04;
      pose.headYaw = decayingSwing(sinceChange, 0.22, 2.2, 1.1);
      pose.leftHand = HAND_RAISED.left;
      pose.rightHand = HAND_RAISED.right;
      break;
  }
  return pose;
}

function dampValue(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function dampVec(current: Vec3, target: Vec3, lambda: number, dt: number): Vec3 {
  return [
    dampValue(current[0], target[0], lambda, dt),
    dampValue(current[1], target[1], lambda, dt),
    dampValue(current[2], target[2], lambda, dt),
  ];
}

/** Aproxima `current` de `target` com suavização exponencial (evita saltos ao trocar de estado). */
export function dampPose(current: Pose, target: Pose, dt: number): void {
  current.breath = dampValue(current.breath, target.breath, 6, dt);
  current.lean = dampValue(current.lean, target.lean, 4, dt);
  current.headPitch = dampValue(current.headPitch, target.headPitch, 8, dt);
  current.headYaw = dampValue(current.headYaw, target.headYaw, 8, dt);
  current.headRoll = dampValue(current.headRoll, target.headRoll, 5, dt);
  current.blink = dampValue(current.blink, target.blink, 40, dt);
  current.leftHand = dampVec(current.leftHand, target.leftHand, 6, dt);
  current.rightHand = dampVec(current.rightHand, target.rightHand, 6, dt);
  current.typing = dampValue(current.typing, target.typing, 5, dt);
  current.typingSpeed = dampValue(current.typingSpeed, target.typingSpeed, 5, dt);
}
