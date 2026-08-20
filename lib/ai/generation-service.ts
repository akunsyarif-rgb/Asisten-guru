import { getModelAdapter } from "./provider";
import { buildPrompt } from "@/lib/prompts/engine";
import { runValidationPipeline, type ValidationOutcome } from "@/lib/validation/pipeline";
import { filterContextForModule } from "@/lib/context/engine";
import type { ModuleDefinition } from "@/types/module";
import type { ContextObject } from "@/types/context";

const MAX_ATTEMPTS = 2;

/**
 * Generation Service — the last stage of
 * AI Provider -> Model Adapter -> Prompt Engine -> Generation Service
 * (blueprint section 06). Builds the prompt, calls the adapter, and runs
 * the response through the Validation Layer. On a schema/content failure it
 * retries once with a repair instruction; if it still fails, it returns an
 * "error" outcome rather than ever handing broken output to the editor.
 */
export async function generateModuleContent(
  module: ModuleDefinition,
  context: ContextObject,
): Promise<ValidationOutcome> {
  const adapter = getModelAdapter();
  const filteredContext = filterContextForModule(context, module);
  const { systemPrompt, userPrompt } = buildPrompt(module, filteredContext);

  let lastOutcome: ValidationOutcome = {
    status: "error",
    message: "Generation belum dijalankan.",
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const repairSuffix =
      attempt > 1
        ? `\n\nPERCOBAAN SEBELUMNYA GAGAL: ${describeFailure(lastOutcome)}. Perbaiki dan kembalikan JSON yang valid sesuai skema.`
        : "";

    const result = await adapter.complete({
      systemPrompt,
      userPrompt: userPrompt + repairSuffix,
      temperature: 0.4,
    });

    lastOutcome = runValidationPipeline(result.text);

    if (lastOutcome.status === "completed") {
      return lastOutcome;
    }
    if (lastOutcome.status === "warning") {
      // Warnings are shown to the user, not silently retried away — a
      // placeholder is honest data, not a defect (blueprint section 09).
      return lastOutcome;
    }
    // status === "error": loop again up to MAX_ATTEMPTS.
  }

  return lastOutcome;
}

function describeFailure(outcome: ValidationOutcome): string {
  return outcome.status === "error" ? outcome.message : "";
}
