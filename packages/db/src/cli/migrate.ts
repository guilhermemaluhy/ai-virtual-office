/**
 * Applies `supabase/migrations/*.sql` to an EMPTY Postgres given by DATABASE_URL.
 * `--stub-auth` creates a fake `auth` schema first (plain Postgres, CI). For the real
 * Supabase project use `supabase db push`, which tracks applied migrations.
 */
import { parseEnv } from '@aivo/shared';
import { createDatabase } from '../client.js';
import { dbEnvSchema } from '../config.js';
import { applyMigrations } from '../migrate.js';

const stubAuth = process.argv.includes('--stub-auth');
const { DATABASE_URL } = parseEnv(dbEnvSchema);
const connection = createDatabase(DATABASE_URL);
try {
  const applied = await applyMigrations(connection.exec, { stubAuth });
  for (const migration of applied) console.info(`[db] applied ${migration.name}`);
} finally {
  await connection.close();
}
