import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import type { Schema } from './client.js';
import { applyMigrations } from './migrate.js';
import * as schema from './schema.js';

export interface TestDatabase {
  db: PgliteDatabase<Schema>;
  /** Inserts a fake Auth user and returns its id (the first one becomes the owner). */
  createAuthUser(email: string): Promise<string>;
  /** Makes `auth.uid()` return `userId` for the rest of the connection (`null` logs out). */
  signIn(userId: string | null): Promise<void>;
  close(): Promise<void>;
}

/**
 * In-process Postgres (PGlite) with the fake `auth` schema and every migration
 * applied. PGlite runs as superuser, so RLS is NOT enforced here; the tests cover
 * schema, triggers and functions, not the policies themselves.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await applyMigrations(
    async (script) => {
      await client.exec(script);
    },
    { stubAuth: true },
  );
  return {
    db,
    async createAuthUser(email) {
      const rows = await db
        .insert(schema.authUsers)
        .values({ id: crypto.randomUUID(), email })
        .returning({ id: schema.authUsers.id });
      const id = rows[0]?.id;
      if (!id) throw new Error('auth user not inserted');
      return id;
    },
    async signIn(userId) {
      await db.execute(sql`select set_config('request.jwt.claim.sub', ${userId ?? ''}, false)`);
    },
    close: () => client.close(),
  };
}
