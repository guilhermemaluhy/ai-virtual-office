import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import pg from 'pg';
import * as schema from './schema.js';

export type Schema = typeof schema;

/** Driver-agnostic database handle (node-postgres in production, PGlite in tests). */
export type Database = PgDatabase<PgQueryResultHKT, Schema>;

/** Runs a multi-statement SQL script (simple query protocol, no parameters). */
export type SqlScriptRunner = (script: string) => Promise<void>;

export interface DatabaseConnection {
  db: NodePgDatabase<Schema>;
  exec: SqlScriptRunner;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string): DatabaseConnection {
  const pool = new pg.Pool({ connectionString });
  return {
    db: drizzle(pool, { schema }),
    exec: async (script) => {
      await pool.query(script);
    },
    close: () => pool.end(),
  };
}
