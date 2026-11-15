import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SqlScriptRunner } from './client.js';

/** `supabase/migrations` at the repository root: the source of truth for the schema. */
export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL('../../../supabase/migrations/', import.meta.url),
);

/** Minimal `auth` schema for databases that are not Supabase (tests, CI). */
export const AUTH_STUB_FILE = fileURLToPath(new URL('../sql/auth-stub.sql', import.meta.url));

export interface MigrationFile {
  name: string;
  path: string;
}

/** Migration files in the order Supabase applies them (by timestamp prefix). */
export async function listMigrations(folder = MIGRATIONS_FOLDER): Promise<MigrationFile[]> {
  const entries = await readdir(folder);
  return entries
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => ({ name, path: join(folder, name) }));
}

export interface ApplyMigrationsOptions {
  /** Create the fake `auth` schema first. Never use against a real Supabase project. */
  stubAuth?: boolean;
  folder?: string;
}

/**
 * Applies every migration file to an EMPTY database, in order, through `exec` (a
 * multi-statement script runner). Production uses the
 * Supabase CLI (`supabase db push`), which tracks what was already applied; this
 * helper exists for tests and for the CI check "migrations apply on a clean DB".
 */
export async function applyMigrations(
  exec: SqlScriptRunner,
  { stubAuth = false, folder = MIGRATIONS_FOLDER }: ApplyMigrationsOptions = {},
): Promise<MigrationFile[]> {
  if (stubAuth) {
    await exec(await readFile(AUTH_STUB_FILE, 'utf8'));
  }
  const migrations = await listMigrations(folder);
  for (const migration of migrations) {
    await exec(await readFile(migration.path, 'utf8'));
  }
  return migrations;
}
