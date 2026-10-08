import { PGlite } from '@electric-sql/pglite';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Schema } from './client.js';
import { MIGRATIONS_FOLDER } from './migrate.js';
import * as schema from './schema.js';

export interface TestDatabase {
  db: PgliteDatabase<Schema>;
  close(): Promise<void>;
}

/** In-process Postgres (PGlite) with all migrations applied. For tests only. */
export async function createTestDatabase(): Promise<TestDatabase> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db, close: () => client.close() };
}
