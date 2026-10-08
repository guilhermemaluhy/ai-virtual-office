import { dbEnvSchema } from '@aivo/db';
import { parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const apiEnvSchema = dbEnvSchema.extend({
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  /** Optional: without it the agents answer in offline (rule-based) mode. */
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  AI_MODEL: z.string().min(1).optional(),
  AI_EFFORT: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  /** Comma-separated list of browser origins allowed by CORS. */
  WEB_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const loadApiEnv = (source?: Record<string, string | undefined>): ApiEnv =>
  parseEnv(apiEnvSchema, source);
