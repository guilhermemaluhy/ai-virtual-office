import { describe, expect, it } from 'vitest';
import { loadApiEnv } from './env.js';

describe('loadApiEnv', () => {
  it('applies defaults and requires DATABASE_URL', () => {
    expect(
      loadApiEnv({ API_PORT: '4000', DATABASE_URL: 'postgresql://u:p@localhost:5432/db' }),
    ).toMatchObject({ API_HOST: '0.0.0.0', API_PORT: 4000 });
    expect(() => loadApiEnv({})).toThrow(/DATABASE_URL/);
  });
});
