import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { loadApiEnv } from './env.js';

describe('api', () => {
  it('GET /health returns ok', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  it('loads env with defaults', () => {
    expect(loadApiEnv({ API_PORT: '4000' })).toMatchObject({ API_HOST: '0.0.0.0', API_PORT: 4000 });
  });
});
