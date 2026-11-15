import { officeSettings } from '@aivo/db';
import { createTestDatabase, type TestDatabase } from '@aivo/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runTick } from './tick.js';

describe('runTick', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  }, 30_000);

  afterAll(async () => {
    await testDb.close();
  });

  it('is idle while the office is on and skips work while paused', async () => {
    expect(await runTick(testDb.db)).toBe('idle');
    await testDb.db.update(officeSettings).set({ paused: true });
    expect(await runTick(testDb.db)).toBe('paused');
  });
});
