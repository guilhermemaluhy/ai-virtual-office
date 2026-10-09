import { Html } from '@react-three/drei';
import { STATUS_LABEL, type AgentProfile, type AgentStatus } from '../../agent/agentState.js';
import type { Vec3 } from '../../lib/math.js';

interface AgentTagProps {
  readonly profile: AgentProfile;
  readonly status: AgentStatus;
  readonly selected: boolean;
  readonly hovered: boolean;
  readonly position: Vec3;
}

/** Etiqueta flutuante com nome, função e status (HTML ancorado ao 3D). */
export function AgentTag({ profile, status, selected, hovered, position }: AgentTagProps) {
  const expanded = selected || hovered;
  return (
    <Html position={position} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
      <div className="agent-tag" data-status={status} data-expanded={expanded}>
        <span className="agent-tag__dot" aria-hidden="true" />
        <span className="agent-tag__name">{profile.name}</span>
        {expanded && <span className="agent-tag__role">{profile.role}</span>}
        <span className="agent-tag__status">{STATUS_LABEL[status]}</span>
      </div>
    </Html>
  );
}
