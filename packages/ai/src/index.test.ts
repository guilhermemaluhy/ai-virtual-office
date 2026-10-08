import { describe, expect, it } from 'vitest';
import { EchoProvider } from './index.js';

describe('EchoProvider', () => {
  it('echoes the last message', async () => {
    const provider = new EchoProvider();
    await expect(
      provider.complete({
        messages: [
          { role: 'system', content: 'sys' },
          { role: 'user', content: 'hello' },
        ],
      }),
    ).resolves.toEqual({ content: 'hello' });
  });

  it('returns empty content for no messages', async () => {
    await expect(new EchoProvider().complete({ messages: [] })).resolves.toEqual({ content: '' });
  });
});
