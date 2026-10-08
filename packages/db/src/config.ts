import { baseEnvSchema, parseEnv } from '@aivo/shared';
import { z } from 'zod';

export const dbEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.url().refine((value) => /^postgres(ql)?:\/\//.test(value), {
    message: 'must be a postgres:// or postgresql:// URL',
  }),
});

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/** Parses DATABASE_URL into connection settings. */
export function getDatabaseConfig(
  source: Record<string, string | undefined> = process.env,
): DatabaseConfig {
  const { DATABASE_URL } = parseEnv(dbEnvSchema, source);
  const url = new URL(DATABASE_URL);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}
