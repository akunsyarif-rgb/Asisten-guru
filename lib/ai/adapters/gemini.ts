import { aiConfig } from "@/config/ai";
import type { ModelAdapter, ModelCompletionRequest, ModelCompletionResult } from "../provider";

/**
 * Google Gemini adapter (via the Generative Language API / Google AI
 * Studio). Gemini offers a genuinely free tier — no billing required —
 * which is why it's offered alongside the paid OpenAI/Anthropic adapters.
 */
export const geminiAdapter: ModelAdapter = {
  name: "gemini",
  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    if (!aiConfig.gemini.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Set AI_PROVIDER=mock for local development.",
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.gemini.model}:generateContent?key=${aiConfig.gemini.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
        generationConfig: {
          temperature: request.temperature ?? 0.4,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini request failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return { text, provider: "gemini", model: aiConfig.gemini.model };
  },
};
