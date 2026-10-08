import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { baseEnvSchema, EnvValidationError, parseEnv } from './index.js';

describe('parseEnv', () => {
  it('applies defaults', () => {
    expect(parseEnv(baseEnvSchema, {})).toEqual({ NODE_ENV: 'development', LOG_LEVEL: 'info' });
  });

  it('throws a readable error on invalid input', () => {
    const schema = z.object({ PORT: z.coerce.number().int().positive() });
    expect(() => parseEnv(schema, { PORT: 'abc' })).toThrow(EnvValidationError);
    expect(() => parseEnv(schema, { PORT: 'abc' })).toThrow(/PORT/);
  });
});
