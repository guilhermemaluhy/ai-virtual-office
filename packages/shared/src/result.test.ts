import { describe, expect, it } from 'vitest';
import { err, ok } from './index.js';

describe('Result', () => {
  it('builds ok and err variants', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err('boom')).toEqual({ ok: false, error: 'boom' });
  });
});
