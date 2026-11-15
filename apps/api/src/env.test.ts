import { EnvValidationError } from '@aivo/shared';
import { describe, expect, it } from 'vitest';
import { loadApiEnv, loadSupabaseAdminEnv } from './env.js';

const DATABASE_URL = 'postgresql://postgres:secret@db.example.supabase.co:5432/postgres';

describe('loadApiEnv', () => {
  it('applies defaults', () => {
    expect(loadApiEnv({ DATABASE_URL })).toMatchObject({
      API_HOST: '0.0.0.0',
      API_PORT: 3001,
      WEB_ORIGIN: ['http://localhost:3000'],
    });
  });

  it('splits WEB_ORIGIN into a list', () => {
    expect(
      loadApiEnv({ DATABASE_URL, WEB_ORIGIN: 'https://a.netlify.app, http://localhost:3000' })
        .WEB_ORIGIN,
    ).toEqual(['https://a.netlify.app', 'http://localhost:3000']);
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => loadApiEnv({})).toThrow(EnvValidationError);
  });
});

describe('loadSupabaseAdminEnv', () => {
  it('requires the service role key', () => {
    expect(() => loadSupabaseAdminEnv({ SUPABASE_URL: 'https://x.supabase.co' })).toThrow(
      EnvValidationError,
    );
  });
});
