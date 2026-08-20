import { aiConfig } from "@/config/ai";
import type { ModelAdapter, ModelCompletionRequest, ModelCompletionResult } from "../provider";

export const anthropicAdapter: ModelAdapter = {
  name: "anthropic",
  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    if (!aiConfig.anthropic.apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Set AI_PROVIDER=mock for local development.",
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiConfig.anthropic.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: aiConfig.anthropic.model,
        max_tokens: 4096,
        temperature: request.temperature ?? 0.4,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic request failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    return { text, provider: "anthropic", model: aiConfig.anthropic.model };
  },
};
