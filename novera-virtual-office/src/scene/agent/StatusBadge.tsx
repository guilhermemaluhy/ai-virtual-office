import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { STATUS_COLOR, type AgentStatus } from '../../agent/agentState.js';
import type { Vec3 } from '../../lib/math.js';

interface StatusBadgeProps {
  readonly status: AgentStatus;
  readonly position: Vec3;
}

/** Esfera luminosa sobre a cabeça: cor por estado, pulsa ao executar, pisca em erro. */
export function StatusBadge({ status, position }: StatusBadgeProps) {
  const group = useRef<Group>(null);
  const material = useRef<MeshStandardMaterial>(null);

  useEffect(() => {
    const m = material.current;
    if (!m) return;
    m.color.set(STATUS_COLOR[status]);
    m.emissive.set(STATUS_COLOR[status]);
  }, [status]);

  useFrame(({ clock }) => {
    const g = group.current;
    const m = material.current;
    if (!g || !m) return;
    const t = clock.elapsedTime;
    g.position.y = position[1] + 0.012 * Math.sin(t * 1.6);
    const pulse = status === 'executing' ? 1 + 0.25 * Math.sin(t * 7) : 1;
    g.scale.setScalar(pulse);
    m.emissiveIntensity =
      status === 'error' ? (Math.sin(t * 9) > 0 ? 2.4 : 0.4) : status === 'idle' ? 0.8 : 1.6;
  });

  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshStandardMaterial
          ref={material}
          color={STATUS_COLOR[status]}
          emissive={STATUS_COLOR[status]}
          emissiveIntensity={1.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
