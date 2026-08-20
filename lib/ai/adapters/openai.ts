import { aiConfig } from "@/config/ai";
import type { ModelAdapter, ModelCompletionRequest, ModelCompletionResult } from "../provider";

export const openaiAdapter: ModelAdapter = {
  name: "openai",
  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    if (!aiConfig.openai.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Set AI_PROVIDER=mock for local development.",
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.openai.model,
        temperature: request.temperature ?? 0.4,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return { text, provider: "openai", model: aiConfig.openai.model };
  },
};
