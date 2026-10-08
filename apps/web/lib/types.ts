import type {
  AgentRole,
  AgentState,
  ApprovalStatus,
  Marketplace,
  RiskLevel,
  TaskStatus,
} from '@aivo/shared';

/** Shapes returned by apps/api (JSON-serialised rows). */
export interface AgentDto {
  id: string;
  name: string;
  title: string;
  role: AgentRole;
  marketplace: Marketplace | null;
  reportsTo: string | null;
  state: AgentState;
  autonomy: RiskLevel;
}

export interface TaskDto {
  id: string;
  agentId: string;
  title: string;
  details: string | null;
  status: TaskStatus;
  createdAt: string;
}

export interface ApprovalDto {
  id: string;
  requestedBy: string;
  action: string;
  summary: string;
  risk: RiskLevel;
  status: ApprovalStatus;
  decidedBy: string | null;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface DashboardSummaryDto {
  marketplaces: {
    marketplace: Marketplace;
    activeListings: number;
    orders30d: number;
    revenue30dCents: number;
  }[];
  stock: { outOfStock: number; lowStock: number };
  pendingApprovals: number;
}

export interface AgentDetailDto extends AgentDto {
  tasks: TaskDto[];
}
