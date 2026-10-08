export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
}

export interface CompletionResponse {
  content: string;
}

/** Provider-agnostic LLM contract. Concrete providers are implemented in a later phase. */
export interface LlmProvider {
  readonly name: string;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
}

/** Deterministic provider for tests and local development without API keys. */
export class EchoProvider implements LlmProvider {
  readonly name = 'echo';

  complete(request: CompletionRequest): Promise<CompletionResponse> {
    const last = request.messages.at(-1);
    return Promise.resolve({ content: last?.content ?? '' });
  }
}
