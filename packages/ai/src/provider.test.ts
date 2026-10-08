import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import {
  AnthropicProvider,
  createLlmProvider,
  EchoProvider,
  LlmError,
  OfflineProvider,
} from './index.js';

function fakeClient(result: unknown) {
  const create = vi.fn(() =>
    result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
  );
  return {
    client: { beta: { messages: { create } } } as unknown as Pick<Anthropic, 'beta'>,
    create,
  };
}

describe('AnthropicProvider', () => {
  it('sends the default model with refusal fallbacks and returns the text', async () => {
    const { client, create } = fakeClient({
      stop_reason: 'end_turn',
      content: [
        { type: 'thinking', thinking: '' },
        { type: 'text', text: 'Olá, CEO.' },
      ],
    });
    const provider = new AnthropicProvider({ client });
    const result = await provider.complete({
      system: 'Você é a Camila.',
      messages: [{ role: 'user', content: 'Oi' }],
    });

    expect(result.content).toBe('Olá, CEO.');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-opus-5-5',
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: 'Você é a Camila.',
      }),
    );
  });

  it('turns a refusal into an LlmError', async () => {
    const { client } = fakeClient({ stop_reason: 'refusal', content: [] });
    await expect(new AnthropicProvider({ client }).complete({ messages: [] })).rejects.toThrow(
      LlmError,
    );
  });

  it('maps rate limits to a retryable error', async () => {
    const error = new Anthropic.RateLimitError(429, undefined, 'rate limited', new Headers());
    const { client } = fakeClient(error);
    await expect(
      new AnthropicProvider({ client }).complete({ messages: [{ role: 'user', content: 'x' }] }),
    ).rejects.toMatchObject({ retryable: true });
  });
});

describe('createLlmProvider', () => {
  it('stays offline without an API key', () => {
    const provider = createLlmProvider({});
    expect(provider).toBeInstanceOf(OfflineProvider);
    expect(provider.available).toBe(false);
  });

  it('uses Claude when a key is set', () => {
    const provider = createLlmProvider({
      ANTHROPIC_API_KEY: 'sk-test',
      AI_MODEL: 'claude-sonnet-5-5',
    });
    expect(provider).toBeInstanceOf(AnthropicProvider);
    expect((provider as AnthropicProvider).model).toBe('claude-sonnet-5-5');
  });
});

describe('EchoProvider', () => {
  it('echoes the last message', async () => {
    await expect(
      new EchoProvider().complete({ messages: [{ role: 'user', content: 'oi' }] }),
    ).resolves.toEqual({
      content: 'oi',
    });
  });
});
