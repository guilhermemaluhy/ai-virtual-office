import { Building2 } from 'lucide-react';
import { APP_NAME } from '../config/app.js';
import { SYSTEM_STATUS_LABEL, type SystemStatus } from '../systemStatus.js';
import { AgentChip } from './AgentChip.js';

interface TopBarProps {
  readonly status: SystemStatus;
}

export function TopBar({ status }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <Building2 size={18} aria-hidden="true" />
        <span>{APP_NAME}</span>
      </div>
      <div className="top-bar__right">
        {status === 'ready' && <AgentChip />}
        <div className="status-pill" data-status={status} role="status" aria-live="polite">
          <span className="status-pill__dot" aria-hidden="true" />
          {SYSTEM_STATUS_LABEL[status]}
        </div>
      </div>
    </header>
  );
}
