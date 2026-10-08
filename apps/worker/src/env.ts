import { baseEnvSchema, parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const workerEnvSchema = baseEnvSchema.extend({
  REDIS_URL: z.url().default('redis://localhost:6379'),
  WORKER_TICK_MS: z.coerce.number().int().positive().default(5000),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export const loadWorkerEnv = (source?: Record<string, string | undefined>): WorkerEnv =>
  parseEnv(workerEnvSchema, source);
