import { SYSTEM_RULES } from "./system-rules";
import type { ModuleDefinition } from "@/types/module";

export interface PromptEngineOutput {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Assembles SYSTEM RULES + TASK PROMPT + CONTEXT OBJECT + OUTPUT SCHEMA
 * (blueprint section 07) into the two strings a Model Adapter needs. The
 * module owns its Task Prompt; the engine owns composition and the output
 * contract instructions.
 */
export function buildPrompt(
  module: ModuleDefinition,
  filteredContext: Record<string, unknown>,
): PromptEngineOutput {
  const taskPrompt = module.buildTaskPrompt(filteredContext);

  const outputContract = `SKEMA OUTPUT
Kembalikan JSON dengan bentuk persis:
{
  "title": string,
  "html": string,
  "placeholders": string[]
}
"placeholders" berisi setiap tanda [Perlu dilengkapi: ...] yang Anda gunakan di dalam "html".`;

  const userPrompt = [
    `TASK PROMPT — ${module.name}`,
    taskPrompt,
    "",
    "CONTEXT OBJECT (JSON, hanya berisi data yang relevan untuk modul ini):",
    JSON.stringify(filteredContext, null, 2),
    "",
    outputContract,
  ].join("\n");

  return { systemPrompt: SYSTEM_RULES, userPrompt };
}
