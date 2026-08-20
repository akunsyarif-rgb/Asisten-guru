import { wizardFormSchema } from "@/schemas/context.schema";
import type { WizardFormState, ContextObject } from "@/types/context";
import type { ModuleDefinition } from "@/types/module";

export interface ContextEngineIssue {
  path: string;
  message: string;
}

export type ContextEngineResult =
  | { ok: true; context: ContextObject }
  | { ok: false; issues: ContextEngineIssue[] };

/**
 * Context Engine (blueprint section 08): Form -> Normalize -> Validate ->
 * Context Object. Everything downstream (prompt engine, modules) only ever
 * sees the Context Object produced here, never the raw form.
 */
export function buildContextObject(form: WizardFormState): ContextEngineResult {
  const normalized = normalize(form);
  const parsed = wizardFormSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const { dataPembelajaran, pembelajaran, asesmen } = parsed.data;
  return { ok: true, context: { dataPembelajaran, pembelajaran, asesmen } };
}

function normalize(form: WizardFormState): WizardFormState {
  const trim = (value: string | undefined) => value?.trim() ?? "";
  return {
    ...form,
    dataPembelajaran: {
      mapel: trim(form.dataPembelajaran?.mapel),
      faseKelas: trim(form.dataPembelajaran?.faseKelas),
      materi: trim(form.dataPembelajaran?.materi),
      alokasiWaktu: trim(form.dataPembelajaran?.alokasiWaktu),
      kompetensiAwal: trim(form.dataPembelajaran?.kompetensiAwal) || undefined,
    },
    pembelajaran: {
      tujuanPembelajaran: trim(form.pembelajaran?.tujuanPembelajaran),
      targetHasilBelajar: trim(form.pembelajaran?.targetHasilBelajar) || undefined,
      metodeModel: trim(form.pembelajaran?.metodeModel),
      aktivitas: trim(form.pembelajaran?.aktivitas) || undefined,
      sarana: trim(form.pembelajaran?.sarana) || undefined,
    },
    asesmen: {
      bentukAsesmen: trim(form.asesmen?.bentukAsesmen),
      instrumen: trim(form.asesmen?.instrumen) || undefined,
      remedial: trim(form.asesmen?.remedial) || undefined,
      pengayaan: trim(form.asesmen?.pengayaan) || undefined,
    },
  };
}

/**
 * Context Filter (blueprint section 08 & principle "Context-Minimal"):
 * a module only receives the context keys it declares in
 * `requiredContext`, plus any completed dependency outputs it asked for.
 */
export function filterContextForModule(
  context: ContextObject,
  module: ModuleDefinition,
): Record<string, unknown> {
  const full: Record<string, unknown> = {
    dataPembelajaran: context.dataPembelajaran,
    pembelajaran: context.pembelajaran,
    asesmen: context.asesmen,
  };

  const filtered: Record<string, unknown> = {};
  for (const key of module.requiredContext) {
    if (key in full) filtered[key] = full[key];
  }

  if (module.dependencies.length > 0 && context.dependencyOutputs) {
    filtered.dependencyOutputs = Object.fromEntries(
      module.dependencies
        .filter((dep) => dep in (context.dependencyOutputs ?? {}))
        .map((dep) => [dep, context.dependencyOutputs![dep]]),
    );
  }

  return filtered;
}
