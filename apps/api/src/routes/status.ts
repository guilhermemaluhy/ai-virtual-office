import { employees, officeSettings, type Database } from '@aivo/db';
import { DEFAULT_ORGANIZATION_ID } from '@aivo/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

export interface OfficeStatus {
  paused: boolean;
  pausedAt: string | null;
  pauseReason: string | null;
  employees: number;
}

export async function getOfficeStatus(db: Database): Promise<OfficeStatus> {
  const [settings] = await db
    .select()
    .from(officeSettings)
    .where(eq(officeSettings.organizationId, DEFAULT_ORGANIZATION_ID));
  if (!settings) throw new Error('office_settings row missing; run the migrations');
  return {
    paused: settings.paused,
    pausedAt: settings.pausedAt?.toISOString() ?? null,
    pauseReason: settings.pauseReason,
    employees: await db.$count(employees),
  };
}

export function statusRoutes(app: FastifyInstance, db: Database) {
  /** Office status: the stop switch and how many employees were hired. */
  app.get('/status', () => getOfficeStatus(db));
}
