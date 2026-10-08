'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { AgentDto, ApprovalDto, DashboardSummaryDto } from '../lib/types';

export interface OfficeData {
  agents: AgentDto[];
  approvals: ApprovalDto[];
  summary: DashboardSummaryDto | null;
  /** Current in-progress task title per agent id. */
  currentTasks: Record<string, string>;
}

const EMPTY: OfficeData = { agents: [], approvals: [], summary: null, currentTasks: {} };
const POLL_MS = 5000;

/** Loads the office state from the API and refreshes it every few seconds. */
export function useOfficeData() {
  const [data, setData] = useState<OfficeData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [agents, approvals, summary, tasks] = await Promise.all([
        api.agents(),
        api.pendingApprovals(),
        api.summary(),
        api.activeTasks(),
      ]);
      const currentTasks: Record<string, string> = {};
      for (const task of tasks) currentTasks[task.agentId] ??= task.title;
      setData({ agents, approvals, summary, currentTasks });
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [refresh]);

  return { ...data, error, loading, refresh };
}
