/**
 * AI provider configuration (blueprint section 06). The rest of the app
 * talks to `lib/ai/provider.ts` only — swapping the provider/model here
 * never touches business logic, prompts, or validation.
 */
export type AiProviderName = "openai" | "anthropic" | "mock";

export const aiConfig = {
  provider: (process.env.AI_PROVIDER as AiProviderName | undefined) ?? "mock",
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
  },
  rateLimitPerHour: envInt("GENERATION_RATE_LIMIT_PER_HOUR", 30),
} as const;

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
}
