import { AnthropicProvider, type Effort } from './anthropic.js';
import { OfflineProvider, type LlmProvider } from './provider.js';

export interface LlmConfig {
  ANTHROPIC_API_KEY?: string | undefined;
  AI_MODEL?: string | undefined;
  AI_EFFORT?: Effort | undefined;
}

/** Real Claude when an API key is configured, otherwise offline (rule-based) mode. */
export function createLlmProvider(config: LlmConfig): LlmProvider {
  if (!config.ANTHROPIC_API_KEY) return new OfflineProvider();
  return new AnthropicProvider({
    ...(config.AI_MODEL ? { model: config.AI_MODEL } : {}),
    ...(config.AI_EFFORT ? { effort: config.AI_EFFORT } : {}),
  });
}
