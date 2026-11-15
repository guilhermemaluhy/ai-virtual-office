import { dbEnvSchema } from '@aivo/db';
import { parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const workerEnvSchema = dbEnvSchema.extend({
  WORKER_TICK_MS: z.coerce.number().int().positive().default(30_000),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export const loadWorkerEnv = (source?: Record<string, string | undefined>): WorkerEnv =>
  parseEnv(workerEnvSchema, source);
