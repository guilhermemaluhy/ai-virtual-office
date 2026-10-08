import Anthropic from '@anthropic-ai/sdk';
import {
  type CompletionRequest,
  type CompletionResponse,
  LlmError,
  type LlmProvider,
} from './provider.js';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface AnthropicProviderOptions {
  model?: string;
  effort?: Effort;
  /** Injected client (tests). Defaults to `new Anthropic()`, which reads ANTHROPIC_API_KEY. */
  client?: Pick<Anthropic, 'beta'>;
}

export const DEFAULT_MODEL = 'claude-opus-5-5';

/** Claude via the official SDK, with server-side refusal fallbacks enabled. */
export class AnthropicProvider implements LlmProvider {
  readonly name = 'anthropic';
  readonly available = true;
  readonly model: string;
  readonly #effort: Effort;
  readonly #client: Pick<Anthropic, 'beta'>;

  constructor(options: AnthropicProviderOptions = {}) {
    this.model = options.model ?? DEFAULT_MODEL;
    this.#effort = options.effort ?? 'low';
    this.#client = options.client ?? new Anthropic();
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await this.#client.beta.messages.create({
        model: this.model,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: this.#effort },
        ...(request.system ? { system: request.system } : {}),
        messages: request.messages,
      });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new LlmError('Chave da API da Anthropic inválida.', false);
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new LlmError('Limite de uso da IA atingido; tente de novo em instantes.', true);
      }
      if (error instanceof Anthropic.APIError) {
        throw new LlmError(`Erro da IA (${String(error.status)}).`, (error.status ?? 500) >= 500);
      }
      throw error;
    }

    if (response.stop_reason === 'refusal') {
      throw new LlmError('A IA recusou responder a esse pedido.', false);
    }
    const content = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('\n')
      .trim();
    return { content };
  }
}
