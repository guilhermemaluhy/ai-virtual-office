import { useCursor } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { toggleAgentSelected, useAgentState } from '../../agent/agentStore.js';
import { findPlacement } from '../layout.js';
import { AgentTag } from './AgentTag.js';
import { Character } from './Character.js';
import { computePose, dampPose, restingPose } from './characterRig.js';
import { SelectionRing } from './SelectionRing.js';
import { StatusBadge } from './StatusBadge.js';
import type { CharacterHandle } from './types.js';

/**
 * Liga o estado do agente (store) ao personagem (modelo): a cada quadro calcula a
 * pose-alvo, suaviza e aplica. Também cuida de seleção, cursor, etiqueta e anel.
 */
export function AgentCharacter() {
  const chair = findPlacement('chair');
  const profile = useAgentState((s) => s.profile);
  const status = useAgentState((s) => s.status);
  const statusChangedAt = useAgentState((s) => s.statusChangedAt);
  const selected = useAgentState((s) => s.selected);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const character = useRef<CharacterHandle>(null);
  const pose = useRef(restingPose());

  useFrame(({ clock }, delta) => {
    const sinceChange = (performance.now() - statusChangedAt) / 1000;
    const target = computePose(status, clock.elapsedTime, sinceChange);
    dampPose(pose.current, target, Math.min(delta, 0.1));
    character.current?.applyPose(pose.current, clock.elapsedTime);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    toggleAgentSelected();
  };

  return (
    <group
      name={`agent-${profile.id}`}
      position={chair.position}
      rotation-y={chair.rotationY}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <Character ref={character} />
      <StatusBadge status={status} position={[0, 1.56, 0]} />
      <AgentTag
        profile={profile}
        status={status}
        selected={selected}
        hovered={hovered}
        position={[0, 1.7, 0]}
      />
      <SelectionRing visible={selected} />
    </group>
  );
}
