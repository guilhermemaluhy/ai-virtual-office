'use client';

import { Html } from '@react-three/drei';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { Vec3 } from '../../lib/office/layout';
import { colorsFor, PALETTE, pickFor, ROLE_ICONS } from '../../lib/office/theme';
import type { AgentDto } from '../../lib/types';

export interface AvatarProps {
  agent: AgentDto;
  position: Vec3;
  /** Rotation around y; 0 faces the camera (+z). */
  facing?: number;
  currentTask?: string | undefined;
  selected: boolean;
  onSelect: (id: string) => void;
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

export function Avatar({
  agent,
  position,
  facing = 0,
  currentTask,
  selected,
  onSelect,
}: AvatarProps) {
  const body = useRef<Group>(null);
  const colors = colorsFor(agent.marketplace);
  const skin = pickFor(agent.id, PALETTE.skin);
  const hair = pickFor(`${agent.id}-hair`, PALETTE.hair);
  const phase = pickFor(agent.id, [0, 1.3, 2.1, 3.7, 4.4]);

  useFrame(({ clock }) => {
    if (!body.current) return;
    const t = clock.elapsedTime + phase;
    switch (agent.state) {
      case 'working':
        body.current.position.y = Math.abs(Math.sin(t * 7)) * 0.02;
        body.current.rotation.x = 0.06;
        break;
      case 'awaiting_approval':
        body.current.position.y = 0;
        body.current.rotation.x = -0.05;
        body.current.rotation.z = Math.sin(t * 2) * 0.04;
        break;
      case 'idle':
        body.current.position.y = Math.sin(t * 1.5) * 0.01;
        body.current.rotation.x = -0.14;
        break;
      default:
        body.current.position.y = 0;
        body.current.rotation.x = 0;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(agent.id);
  };

  if (agent.state === 'offline') return null;

  return (
    <group position={position} rotation={[0, facing, 0]} onClick={handleClick}>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.55, 0.68, 40]} />
          <meshBasicMaterial color={PALETTE.ceo} />
        </mesh>
      )}

      {/* Chair */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.52, 0.08, 0.5]} />
        <meshStandardMaterial color="#59627a" />
      </mesh>
      <mesh position={[0, 0.8, -0.25]} castShadow>
        <boxGeometry args={[0.52, 0.66, 0.07]} />
        <meshStandardMaterial color="#59627a" />
      </mesh>

      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, 0.86, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.34, 6, 14]} />
          <meshStandardMaterial color={colors.shirt} />
        </mesh>
        {/* Arms */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.29, 0.86, 0.12]} rotation={[-1.1, 0, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.26, 4, 8]} />
            <meshStandardMaterial color={colors.shirt} />
          </mesh>
        ))}
        {/* Head */}
        <mesh position={[0, 1.36, 0]} castShadow>
          <sphereGeometry args={[0.21, 20, 16]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0, 1.42, -0.02]} castShadow>
          <sphereGeometry args={[0.215, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.075, 1.38, 0.19]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#1d1d25" />
          </mesh>
        ))}

        {agent.role === 'diretor' && (
          <mesh position={[0, 0.95, 0.235]}>
            <boxGeometry args={[0.07, 0.3, 0.02]} />
            <meshStandardMaterial color={colors.accent} />
          </mesh>
        )}
        {agent.role === 'atendimento' && (
          <>
            <mesh position={[0, 1.4, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.23, 0.025, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#2b2f3a" />
            </mesh>
            <mesh position={[0.16, 1.27, 0.14]} rotation={[0.4, 0.6, 0]}>
              <capsuleGeometry args={[0.015, 0.14, 4, 6]} />
              <meshStandardMaterial color="#2b2f3a" />
            </mesh>
          </>
        )}
        {agent.role === 'estrategista' &&
          [-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.075, 1.38, 0.2]}>
              <torusGeometry args={[0.045, 0.01, 6, 16]} />
              <meshStandardMaterial color="#2b2f3a" />
            </mesh>
          ))}
      </group>

      <Html position={[0, 2.05, 0]} center zIndexRange={[30, 0]}>
        <div
          className="avatar-tags"
          onClick={(event) => {
            // The overlay lives inside the canvas' event source; without this the scene
            // would also see the click as a miss and clear the selection.
            event.stopPropagation();
            onSelect(agent.id);
          }}
        >
          {agent.state === 'awaiting_approval' && (
            <div className="bubble bubble--attention">! aprovação</div>
          )}
          {agent.state === 'working' && currentTask && (
            <div className="bubble">{truncate(currentTask, 30)}</div>
          )}
          {agent.state === 'alert' && <div className="bubble bubble--alert">⚠ alerta</div>}
          <div className={`name-tag${selected ? ' name-tag--selected' : ''}`}>
            {ROLE_ICONS[agent.role]} {agent.name}
          </div>
        </div>
      </Html>
    </group>
  );
}
