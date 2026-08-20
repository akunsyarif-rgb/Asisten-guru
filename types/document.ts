import type { ModuleId } from "./module";

export type DocumentStatus = "draft" | "completed" | "archived";

export interface DocumentContent {
  /** TipTap-compatible HTML for the current MVP output contract (section 10). */
  html: string;
  /** Structured sections, kept alongside HTML so future modules can reason
   *  over content without re-parsing HTML. */
  sections?: Array<{ id: string; heading: string; html: string }>;
  /** Placeholders the AI could not fill from given context — see the
   *  Factuality Lock (section 09): "[Perlu dilengkapi: ...]". */
  placeholders?: string[];
}

export interface DocumentRecord {
  id: string;
  ownerId: string;
  moduleId: ModuleId;
  title: string;
  status: DocumentStatus;
  content: DocumentContent;
  context: Record<string, unknown>;
  templateId: string | null;
  generationJobId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersionRecord {
  id: string;
  documentId: string;
  version: number;
  content: DocumentContent;
  label: string | null;
  createdAt: string;
}
