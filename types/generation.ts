import type { ModuleId } from "./module";
import type { ContextObject, WizardFormState } from "./context";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

/**
 * Per the blueprint, progressive generation status icons: done, generating,
 * queued, warning, error — never a fabricated percentage.
 */
export type GenerationItemStatus =
  | "idle"
  | "queued"
  | "generating"
  | "validating"
  | "completed"
  | "warning"
  | "error"
  | "cancelled";

export interface GenerationJobRecord {
  id: string;
  ownerId: string;
  status: GenerationJobStatus;
  wizardInput: WizardFormState;
  context: ContextObject;
  preset: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationItemRecord {
  id: string;
  jobId: string;
  ownerId: string;
  moduleId: ModuleId;
  documentId: string | null;
  status: GenerationItemStatus;
  dependsOn: ModuleId[];
  attempt: number;
  errorMessage: string | null;
  warningMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}
