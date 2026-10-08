import { dbEnvSchema } from '@aivo/db';
import { parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const apiEnvSchema = dbEnvSchema.extend({
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  /** Comma-separated list of browser origins allowed by CORS. */
  WEB_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const loadApiEnv = (source?: Record<string, string | undefined>): ApiEnv =>
  parseEnv(apiEnvSchema, source);
