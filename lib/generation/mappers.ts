import type { Database } from "@/types/database";
import type { GenerationItemRecord, GenerationJobRecord } from "@/types/generation";
import type { ModuleId } from "@/types/module";

type JobRow = Database["public"]["Tables"]["generation_jobs"]["Row"];
type ItemRow = Database["public"]["Tables"]["generation_items"]["Row"];

export function mapJobRow(row: JobRow): GenerationJobRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    status: row.status as GenerationJobRecord["status"],
    wizardInput: row.wizard_input as unknown as GenerationJobRecord["wizardInput"],
    context: row.context as unknown as GenerationJobRecord["context"],
    preset: row.preset,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapItemRow(row: ItemRow): GenerationItemRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    ownerId: row.owner_id,
    moduleId: row.module_id as ModuleId,
    documentId: row.document_id,
    status: row.status as GenerationItemRecord["status"],
    dependsOn: (row.depends_on ?? []) as ModuleId[],
    attempt: row.attempt,
    errorMessage: row.error_message,
    warningMessage: row.warning_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}
