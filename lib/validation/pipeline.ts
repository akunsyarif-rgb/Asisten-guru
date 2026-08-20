import { moduleOutputSchema, type ModuleOutput } from "@/schemas/module-output.schema";
import { validateContent } from "./content-validator";

export type ValidationOutcome =
  | { status: "completed"; output: ModuleOutput; sanitizedHtml: string }
  | { status: "warning"; output: ModuleOutput; sanitizedHtml: string; message: string }
  | { status: "error"; message: string };

/**
 * Validation Layer (blueprint section 11):
 * AI Response -> Schema Validation -> Content Validation -> Safety/Integrity
 * Check -> Editor. Never lets a broken response reach the editor silently —
 * it either passes clean, passes with a visible warning, or is rejected
 * with an actionable error the caller can retry.
 */
export function runValidationPipeline(rawResponseText: string): ValidationOutcome {
  const parsed = parseJson(rawResponseText);
  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const schemaResult = moduleOutputSchema.safeParse(parsed.value);
  if (!schemaResult.success) {
    return {
      status: "error",
      message: `Output tidak sesuai skema: ${schemaResult.error.issues
        .map((i) => i.path.join(".") || i.message)
        .join(", ")}`,
    };
  }

  const output = schemaResult.data;
  const contentResult = validateContent(output.html);

  const finalOutput: ModuleOutput = { ...output, html: contentResult.sanitizedHtml };

  if (contentResult.ok && output.placeholders.length === 0) {
    return { status: "completed", output: finalOutput, sanitizedHtml: contentResult.sanitizedHtml };
  }

  if (!contentResult.ok) {
    return {
      status: "warning",
      output: finalOutput,
      sanitizedHtml: contentResult.sanitizedHtml,
      message: contentResult.issues.map((i) => i.message).join(" "),
    };
  }

  return {
    status: "warning",
    output: finalOutput,
    sanitizedHtml: contentResult.sanitizedHtml,
    message: `Dokumen berisi ${output.placeholders.length} bagian yang perlu dilengkapi guru.`,
  };
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false; message: string } {
  const trimmed = stripCodeFence(text.trim());
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    return { ok: false, message: "Respons AI bukan JSON yang valid." };
  }
}

function stripCodeFence(text: string): string {
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? (fenceMatch[1] ?? text) : text;
}
