import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getModule } from "@/modules/registry";
import { generateModuleContent } from "@/lib/ai/generation-service";
import { mapItemRow, mapJobRow } from "./mappers";
import type { ContextObject } from "@/types/context";
import type { ModuleId } from "@/types/module";
import type { GenerationItemRecord } from "@/types/generation";

/**
 * Generation Orchestrator (blueprint section 13).
 * Execution policy: independent items run in parallel to cut latency;
 * dependent items (e.g. Rubrik) never start until every module it depends
 * on (e.g. Asesmen) has completed and can supply real context — never
 * generated ahead of its dependency.
 */
export async function runGenerationJob(
  supabase: SupabaseClient<Database>,
  jobId: string,
): Promise<void> {
  const { data: jobRow, error: jobError } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (jobError || !jobRow) throw new Error("Generation job tidak ditemukan.");
  const job = mapJobRow(jobRow);

  await supabase
    .from("generation_jobs")
    .update({ status: "running" })
    .eq("id", jobId);

  const { data: itemRows, error: itemsError } = await supabase
    .from("generation_items")
    .select("*")
    .eq("job_id", jobId);
  if (itemsError || !itemRows) throw new Error("Generation items tidak ditemukan.");

  let items = itemRows.map(mapItemRow);
  const dependencyOutputs: Record<string, unknown> = {};

  // Execute in dependency waves: repeatedly run every item whose
  // dependencies are all resolved (completed or warning — a warning still
  // produced usable content), until no more progress can be made.
  let progressed = true;
  while (progressed) {
    progressed = false;
    const runnable = items.filter(
      (item) =>
        item.status === "idle" &&
        item.dependsOn.every((dep) => isResolved(items, dep)),
    );
    if (runnable.length === 0) break;
    progressed = true;

    await Promise.all(
      runnable.map((item) =>
        runItem(supabase, item, job.context, dependencyOutputs).then((updated) => {
          items = items.map((existing) => (existing.id === updated.id ? updated : existing));
        }),
      ),
    );
  }

  // Anything left idle has an unresolved (failed) dependency upstream —
  // mark it cancelled rather than silently dropping it.
  const stillIdle = items.filter((item) => item.status === "idle");
  if (stillIdle.length > 0) {
    await supabase
      .from("generation_items")
      .update({
        status: "cancelled",
        error_message: "Dibatalkan karena modul yang menjadi dependency gagal dibuat.",
      })
      .in("id", stillIdle.map((i) => i.id));
    items = items.map((item) =>
      stillIdle.some((i) => i.id === item.id)
        ? { ...item, status: "cancelled" as const }
        : item,
    );
  }

  const jobStatus = summarizeJobStatus(items);
  await supabase.from("generation_jobs").update({ status: jobStatus }).eq("id", jobId);
}

function isResolved(items: GenerationItemRecord[], moduleId: ModuleId): boolean {
  const dep = items.find((i) => i.moduleId === moduleId);
  return dep ? dep.status === "completed" || dep.status === "warning" : true;
}

/**
 * Gathers `dependencyOutputs` for a single item from its already-completed
 * sibling items — used when retrying one item without re-running the whole
 * job (blueprint section 26: retry without losing prior work).
 */
export async function getDependencyOutputsForItem(
  supabase: SupabaseClient<Database>,
  jobId: string,
  dependsOn: ModuleId[],
): Promise<Record<string, unknown>> {
  if (dependsOn.length === 0) return {};

  const { data: siblings } = await supabase
    .from("generation_items")
    .select("module_id, document_id")
    .eq("job_id", jobId)
    .in("module_id", dependsOn);

  const outputs: Record<string, unknown> = {};
  for (const sibling of siblings ?? []) {
    if (!sibling.document_id) continue;
    const { data: doc } = await supabase
      .from("documents")
      .select("content")
      .eq("id", sibling.document_id)
      .single();
    const html = (doc?.content as { html?: string } | null)?.html;
    if (html) outputs[sibling.module_id] = html;
  }
  return outputs;
}

export async function runItem(
  supabase: SupabaseClient<Database>,
  item: GenerationItemRecord,
  context: ContextObject,
  dependencyOutputs: Record<string, unknown>,
): Promise<GenerationItemRecord> {
  await supabase
    .from("generation_items")
    .update({ status: "generating", started_at: new Date().toISOString(), attempt: item.attempt + 1 })
    .eq("id", item.id);

  const moduleDef = getModule(item.moduleId);
  const contextWithDeps: ContextObject = { ...context, dependencyOutputs };

  try {
    const outcome = await generateModuleContent(moduleDef, contextWithDeps);

    if (outcome.status === "error") {
      await supabase
        .from("generation_items")
        .update({ status: "error", error_message: outcome.message })
        .eq("id", item.id);
      return { ...item, status: "error", errorMessage: outcome.message };
    }

    await supabase
      .from("generation_items")
      .update({ status: "validating" })
      .eq("id", item.id);

    const { data: documentRow, error: documentError } = await supabase
      .from("documents")
      .insert({
        owner_id: item.ownerId,
        module_id: item.moduleId,
        title: outcome.output.title,
        status: "draft",
        content: {
          html: outcome.sanitizedHtml,
          placeholders: outcome.output.placeholders,
        },
        context: contextWithDeps as unknown as Record<string, unknown>,
        generation_job_id: item.jobId,
      })
      .select("id")
      .single();

    if (documentError || !documentRow) {
      const message = `Gagal menyimpan dokumen: ${documentError?.message ?? "unknown error"}`;
      await supabase
        .from("generation_items")
        .update({ status: "error", error_message: message })
        .eq("id", item.id);
      return { ...item, status: "error", errorMessage: message };
    }

    dependencyOutputs[item.moduleId] = outcome.sanitizedHtml;

    const finalStatus = outcome.status === "warning" ? "warning" : "completed";
    await supabase
      .from("generation_items")
      .update({
        status: finalStatus,
        document_id: documentRow.id,
        warning_message: outcome.status === "warning" ? outcome.message : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    return {
      ...item,
      status: finalStatus,
      documentId: documentRow.id,
      warningMessage: outcome.status === "warning" ? outcome.message : null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat generate.";
    await supabase
      .from("generation_items")
      .update({ status: "error", error_message: message })
      .eq("id", item.id);
    return { ...item, status: "error", errorMessage: message };
  }
}

export function summarizeJobStatus(
  items: GenerationItemRecord[],
): "completed" | "partial" | "failed" {
  const succeeded = items.filter((i) => i.status === "completed" || i.status === "warning");
  const failed = items.filter((i) => i.status === "error" || i.status === "cancelled");

  if (failed.length === 0) return "completed";
  if (succeeded.length === 0) return "failed";
  return "partial";
}
