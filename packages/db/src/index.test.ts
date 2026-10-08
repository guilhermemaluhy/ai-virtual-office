import { EnvValidationError } from '@aivo/shared';
import { describe, expect, it } from 'vitest';
import { getDatabaseConfig } from './index.js';

describe('getDatabaseConfig', () => {
  it('parses DATABASE_URL', () => {
    expect(
      getDatabaseConfig({ DATABASE_URL: 'postgresql://aivo:s%40cret@localhost:5433/aivo' }),
    ).toEqual({
      host: 'localhost',
      port: 5433,
      database: 'aivo',
      user: 'aivo',
      password: 's@cret',
    });
  });

  it('defaults the port to 5432', () => {
    expect(getDatabaseConfig({ DATABASE_URL: 'postgres://u:p@db/x' }).port).toBe(5432);
  });

  it('rejects non-postgres URLs', () => {
    expect(() => getDatabaseConfig({ DATABASE_URL: 'mysql://u:p@db/x' })).toThrow(
      EnvValidationError,
    );
  });
});
