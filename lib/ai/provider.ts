import { aiConfig } from "@/config/ai";
import { openaiAdapter } from "./adapters/openai";
import { anthropicAdapter } from "./adapters/anthropic";
import { mockAdapter } from "./adapters/mock";

export interface ModelCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  /** JSON schema-ish name, used by adapters that support structured output. */
  responseFormatName?: string;
  temperature?: number;
}

export interface ModelCompletionResult {
  text: string;
  provider: string;
  model: string;
}

/**
 * Model Adapter contract (blueprint section 06.1):
 * AI Provider -> Model Adapter -> Prompt Engine -> Generation Service.
 * Every adapter (OpenAI, Anthropic, mock) implements exactly this shape, so
 * switching providers/models is a config change, never a business-logic
 * change.
 */
export interface ModelAdapter {
  readonly name: string;
  complete(request: ModelCompletionRequest): Promise<ModelCompletionResult>;
}

const adapters: Record<string, ModelAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  mock: mockAdapter,
};

/** Resolves the active Model Adapter from AI_PROVIDER config. */
export function getModelAdapter(): ModelAdapter {
  const adapter = adapters[aiConfig.provider];
  if (!adapter) {
    throw new Error(`Unknown AI_PROVIDER "${aiConfig.provider}"`);
  }
  return adapter;
}
