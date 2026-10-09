import { describe, expect, it } from 'vitest';
import { AGENT_STATUSES } from '../../agent/agentState.js';
import { computePose, dampPose, HAND_CHIN, HAND_REST, restingPose } from './characterRig.js';

describe('computePose', () => {
  it('respiração e piscar ficam nos intervalos esperados em todos os estados', () => {
    for (const status of AGENT_STATUSES) {
      for (let t = 0; t < 10; t += 0.25) {
        const pose = computePose(status, t, t);
        expect(pose.breath).toBeGreaterThanOrEqual(0);
        expect(pose.breath).toBeLessThanOrEqual(1);
        expect([0, 1]).toContain(pose.blink);
      }
    }
  });

  it('só digita quando está trabalhando ou executando, e executa mais rápido', () => {
    const typing = AGENT_STATUSES.filter((status) => computePose(status, 1, 1).typing > 0);
    expect(typing).toEqual(['working', 'executing']);
    expect(computePose('executing', 1, 1).typingSpeed).toBeGreaterThan(
      computePose('working', 1, 1).typingSpeed,
    );
  });

  it('pensando leva a mão direita ao queixo e inclina a cabeça', () => {
    const pose = computePose('thinking', 2, 2);
    expect(pose.rightHand).toEqual(HAND_CHIN);
    expect(pose.leftHand).toEqual(HAND_REST.left);
    expect(pose.headRoll).not.toBe(0);
  });

  it('concluído acena com a cabeça logo após a mudança e depois se aquieta', () => {
    const early = Math.abs(computePose('done', 0.2, 0.2).headPitch);
    const late = Math.abs(computePose('done', 8, 8).headPitch);
    expect(early).toBeGreaterThan(0.05);
    expect(late).toBeLessThan(0.005);
  });

  it('erro balança a cabeça (sim/não) e levanta as mãos', () => {
    const pose = computePose('error', 0.11, 0.11);
    expect(Math.abs(pose.headYaw)).toBeGreaterThan(0.05);
    expect(pose.leftHand[1]).toBeGreaterThan(HAND_REST.left[1]);
  });

  it('ocioso mantém as mãos em repouso e inclinação leve', () => {
    const pose = computePose('idle', 3, 3);
    expect(pose.leftHand).toEqual(HAND_REST.left);
    expect(pose.typing).toBe(0);
    expect(Math.abs(pose.lean)).toBeLessThan(0.05);
  });

  it('o piscar ocorre periodicamente', () => {
    let blinks = 0;
    for (let t = 0; t < 20; t += 0.05) blinks += computePose('idle', t, t).blink;
    expect(blinks).toBeGreaterThan(5);
    expect(blinks).toBeLessThan(40);
  });
});

describe('dampPose', () => {
  it('converge para o alvo sem ultrapassá-lo', () => {
    const current = restingPose();
    const target = computePose('executing', 0, 0);
    for (let i = 0; i < 200; i += 1) dampPose(current, target, 1 / 60);
    expect(current.typing).toBeCloseTo(1, 2);
    expect(current.lean).toBeCloseTo(target.lean, 3);
    expect(current.typing).toBeLessThanOrEqual(1);
  });
});
