import { dbEnvSchema } from '@aivo/db';
import { parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const workerEnvSchema = dbEnvSchema.extend({
  REDIS_URL: z.url().default('redis://localhost:6379'),
  /** How often the agents run a work cycle. */
  AGENT_CYCLE_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 60 * 1000),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export const loadWorkerEnv = (source?: Record<string, string | undefined>): WorkerEnv =>
  parseEnv(workerEnvSchema, source);
