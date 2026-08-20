import type { ZodTypeAny } from "zod";

/** The seven document modules defined by the blueprint (section 12). */
export type ModuleId =
  | "modul-ajar"
  | "lkpd"
  | "asesmen"
  | "rubrik"
  | "bahan-ajar"
  | "kisi-kisi"
  | "remedial-pengayaan";

export const ALL_MODULE_IDS: ModuleId[] = [
  "modul-ajar",
  "lkpd",
  "asesmen",
  "rubrik",
  "bahan-ajar",
  "kisi-kisi",
  "remedial-pengayaan",
];

/**
 * A document module definition. Every module is self-contained and can be
 * developed independently (blueprint principle: Modular by Default).
 */
export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  /** Context keys this module needs from the wizard's Context Object. */
  requiredContext: string[];
  /** Other modules whose output must exist before this one can generate. */
  dependencies: ModuleId[];
  /** Builds the task-prompt section for this module from a context object. */
  buildTaskPrompt: (context: Record<string, unknown>) => string;
  /** Zod schema the generated output must satisfy. */
  outputSchema: ZodTypeAny;
  version: number;
}
