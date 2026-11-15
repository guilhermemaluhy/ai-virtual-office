import { officeSettings } from '@aivo/db';
import { createTestDatabase, type TestDatabase } from '@aivo/db/testing';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

describe('api', () => {
  let testDb: TestDatabase;
  let app: FastifyInstance;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = buildApp({ db: testDb.db });
  }, 30_000);

  afterAll(async () => {
    await app.close();
    await testDb.close();
  });

  it('GET /health returns ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('GET /status reports the stop switch and the (empty) team', async () => {
    const response = await app.inject({ method: 'GET', url: '/status' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      paused: false,
      pausedAt: null,
      pauseReason: null,
      employees: 0,
    });

    await testDb.db.update(officeSettings).set({ paused: true, pauseReason: 'teste' });
    expect((await app.inject({ method: 'GET', url: '/status' })).json()).toMatchObject({
      paused: true,
      pauseReason: 'teste',
    });
  });

  it('allows the web origin via CORS', async () => {
    const corsApp = buildApp({ db: testDb.db, corsOrigins: ['http://localhost:3000'] });
    const response = await corsApp.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:3000' },
    });
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    await corsApp.close();
  });
});
