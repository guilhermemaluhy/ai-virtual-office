import { officeSettings, type Database } from '@aivo/db';
import { DEFAULT_ORGANIZATION_ID } from '@aivo/shared';
import { eq } from 'drizzle-orm';

export type TickOutcome = 'paused' | 'idle';

/**
 * One worker cycle. Fase 2: honours the stop switch and does nothing else; the
 * employees' job queue (pg-boss) plugs in here in Fase 4.
 */
export async function runTick(db: Database): Promise<TickOutcome> {
  const [settings] = await db
    .select({ paused: officeSettings.paused })
    .from(officeSettings)
    .where(eq(officeSettings.organizationId, DEFAULT_ORGANIZATION_ID));
  if (!settings) throw new Error('office_settings row missing; run the migrations');
  return settings.paused ? 'paused' : 'idle';
}
