export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  system?: string;
  messages: ChatTurn[];
}

export interface CompletionResponse {
  content: string;
}

/** Provider-agnostic LLM contract. */
export interface LlmProvider {
  readonly name: string;
  /** `false` when no real model is configured (offline mode). */
  readonly available: boolean;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
}

export class LlmError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'LlmError';
  }
}

/** Deterministic provider for tests. */
export class EchoProvider implements LlmProvider {
  readonly name = 'echo';
  readonly available = true;

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    return Promise.resolve({ content: request.messages.at(-1)?.content ?? '' });
  }
}

/** Used when no API key is configured: callers fall back to rule-based text. */
export class OfflineProvider implements LlmProvider {
  readonly name = 'offline';
  readonly available = false;

  complete(): Promise<CompletionResponse> {
    return Promise.reject(new LlmError('IA desligada: configure ANTHROPIC_API_KEY.', false));
  }
}
