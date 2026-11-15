import {
  APPROVAL_STATUSES,
  AUTONOMY_LEVELS,
  DEFAULT_ORGANIZATION_ID,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATES,
  RISK_LEVELS,
  TASK_STATUSES,
} from '@aivo/shared';
import { eq, getTableColumns, getTableName, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  aiUsage,
  auditLog,
  employees,
  listMigrations,
  officeSettings,
  owners,
  PUBLIC_TABLES,
  tasks,
} from './index.js';
import { createTestDatabase, type TestDatabase } from './testing.js';

const sampleEmployee = {
  id: 'analista-estoque',
  role: 'analista_estoque' as const,
  name: 'Helena',
  title: 'Analista de Estoque',
  goal: 'Sugerir compras e apontar rupturas.',
  systemPrompt: 'Você é a analista de estoque.',
  model: 'claude-haiku-5-5' as const,
};

describe('schema (PGlite + supabase/migrations)', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  }, 30_000);

  afterAll(async () => {
    await testDb.close();
  });

  it('has the Fase 2 migrations in order', async () => {
    const files = await listMigrations();
    expect(files.map((f) => f.name)).toEqual([
      '20261115161808_fase2_nucleo.sql',
      '20261115163158_fase2_hardening.sql',
    ]);
  });

  it('Drizzle schema mirrors the SQL tables and columns', async () => {
    const { db } = testDb;
    const rows = await db.execute<{ table_name: string; column_name: string }>(sql`
      select table_name, column_name from information_schema.columns
      where table_schema = 'public' order by table_name, ordinal_position
    `);
    const sqlColumns = new Map<string, Set<string>>();
    for (const row of rows.rows) {
      sqlColumns.set(
        row.table_name,
        (sqlColumns.get(row.table_name) ?? new Set()).add(row.column_name),
      );
    }
    expect([...sqlColumns.keys()].sort()).toEqual(Object.keys(PUBLIC_TABLES).sort());
    const tables: Record<string, PgTable> = PUBLIC_TABLES;
    for (const [name, table] of Object.entries(tables)) {
      expect(getTableName(table)).toBe(name);
      const drizzleColumns = Object.values(getTableColumns(table))
        .map((column) => column.name)
        .sort();
      expect([...(sqlColumns.get(name) ?? [])].sort(), name).toEqual(drizzleColumns);
    }
  });

  it('Postgres enums mirror the domain vocabulary', async () => {
    const { db } = testDb;
    const rows = await db.execute<{ enum: string; labels: string[] }>(sql`
      select t.typname as enum, array_agg(e.enumlabel order by e.enumsortorder) as labels
      from pg_type t join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' group by t.typname
    `);
    const enums = Object.fromEntries(rows.rows.map((row) => [row.enum, row.labels]));
    expect(enums).toMatchObject({
      employee_role: [...EMPLOYEE_ROLES],
      employee_state: [...EMPLOYEE_STATES],
      autonomy_level: [...AUTONOMY_LEVELS],
      risk_level: [...RISK_LEVELS],
      task_status: [...TASK_STATUSES],
      approval_status: [...APPROVAL_STATUSES],
    });
  });

  it('seeds the organization with the office switched on', async () => {
    const { db } = testDb;
    const [settings] = await db.select().from(officeSettings);
    expect(settings).toMatchObject({ organizationId: DEFAULT_ORGANIZATION_ID, paused: false });
    expect(await db.$count(employees)).toBe(0);
  });

  it('the first Auth user becomes the owner; the second does not', async () => {
    const first = await testDb.createAuthUser('dono@example.com');
    const second = await testDb.createAuthUser('outro@example.com');
    const rows = await testDb.db.select().from(owners);
    expect(rows.map((row) => row.userId)).toEqual([first]);
    expect(rows[0]).toMatchObject({ name: 'dono', organizationId: DEFAULT_ORGANIZATION_ID });
    expect(rows.some((row) => row.userId === second)).toBe(false);
  });

  it('only the owner can use the stop switch, and every change is audited', async () => {
    const { db } = testDb;
    const [owner] = await db.select().from(owners);
    if (!owner) throw new Error('owner missing');

    await testDb.signIn(null);
    const denied = await db.execute(sql`select public.set_office_paused(true, 'teste')`).then(
      () => null,
      (error: unknown) => error,
    );
    expect(denied).toBeInstanceOf(Error);
    expect(String((denied as Error).cause)).toMatch(/apenas o dono/);

    await testDb.signIn(owner.userId);
    await db.execute(sql`select public.set_office_paused(true, 'manutenção')`);
    let [settings] = await db.select().from(officeSettings);
    expect(settings).toMatchObject({
      paused: true,
      pausedBy: owner.userId,
      pauseReason: 'manutenção',
    });
    expect(settings?.pausedAt).toBeInstanceOf(Date);

    await db.execute(sql`select public.set_office_paused(false)`);
    [settings] = await db.select().from(officeSettings);
    expect(settings).toMatchObject({ paused: false, pausedBy: null, pauseReason: null });

    const log = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.entity, 'office_settings'))
      .orderBy(auditLog.createdAt);
    expect(log.map((row) => row.action)).toEqual(['office.pause', 'office.resume']);
    expect(log[0]).toMatchObject({ actor: 'dono', actorUserId: owner.userId });
    await testDb.signIn(null);
  });

  it('stores employees, tasks and AI usage with sane defaults', async () => {
    const { db } = testDb;
    const [employee] = await db.insert(employees).values(sampleEmployee).returning();
    expect(employee).toMatchObject({
      autonomy: 'simulacao',
      state: 'offline',
      allowedTools: [],
      schedule: [],
      dailyBudgetMicroUsd: 0,
      organizationId: DEFAULT_ORGANIZATION_ID,
    });
    await expect(
      db.insert(employees).values({ ...sampleEmployee, id: 'outro-estoque' }),
    ).rejects.toThrow(); // one employee per role

    const [task] = await db
      .insert(tasks)
      .values({ employeeId: sampleEmployee.id, kind: 'estoque.sugestao', title: 'Sugerir compra' })
      .returning();
    expect(task).toMatchObject({ status: 'queued', requestedBy: 'sistema', input: {} });

    await db.insert(aiUsage).values({
      employeeId: sampleEmployee.id,
      taskId: task?.id,
      model: 'claude-haiku-5-5',
      inputTokens: 1200,
      outputTokens: 300,
      costMicroUsd: 270,
    });
    const spent = await db.execute<{ spent: string }>(
      sql`select public.employee_cost_today_micro_usd(${sampleEmployee.id}) as spent`,
    );
    expect(Number(spent.rows[0]?.spent)).toBe(270);
  });

  it('bumps updated_at on update', async () => {
    const { db } = testDb;
    const [before] = await db.select().from(employees).where(eq(employees.id, sampleEmployee.id));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const [after] = await db
      .update(employees)
      .set({ state: 'idle' })
      .where(eq(employees.id, sampleEmployee.id))
      .returning();
    expect(after?.updatedAt.getTime()).toBeGreaterThan(before?.updatedAt.getTime() ?? Infinity);
  });
});
