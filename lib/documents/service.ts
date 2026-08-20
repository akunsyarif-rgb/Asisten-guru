import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DocumentRecord, DocumentContent } from "@/types/document";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

function mapDocumentRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    moduleId: row.module_id as DocumentRecord["moduleId"],
    title: row.title,
    status: row.status,
    content: row.content as unknown as DocumentContent,
    context: row.context,
    templateId: row.template_id,
    generationJobId: row.generation_job_id,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDocument(
  supabase: SupabaseClient<Database>,
  documentId: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();
  if (error || !data) return null;
  return mapDocumentRow(data);
}

export async function listDocuments(
  supabase: SupabaseClient<Database>,
  options: { status?: DocumentRecord["status"]; limit?: number } = {},
): Promise<DocumentRecord[]> {
  let query = supabase.from("documents").select("*").order("updated_at", { ascending: false });
  if (options.status) query = query.eq("status", options.status);
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapDocumentRow);
}

/**
 * Autosave: writes the current editor content and takes a version snapshot.
 * Called by the workspace on a debounce (blueprint section 20/27) — the
 * caller is responsible for debouncing; this function itself is a single
 * atomic write plus snapshot.
 */
export async function autosaveDocument(
  supabase: SupabaseClient<Database>,
  documentId: string,
  content: DocumentContent,
): Promise<{ ok: true; savedAt: string } | { ok: false; message: string }> {
  const { data, error } = await supabase
    .from("documents")
    .update({ content: content as unknown as Record<string, unknown> })
    .eq("id", documentId)
    .select("updated_at")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Gagal menyimpan dokumen." };
  }

  await snapshotVersion(supabase, documentId, content);
  return { ok: true, savedAt: data.updated_at };
}

async function snapshotVersion(
  supabase: SupabaseClient<Database>,
  documentId: string,
  content: DocumentContent,
): Promise<void> {
  const { data: doc } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", documentId)
    .single();
  if (!doc) return;

  const { data: latest } = await supabase
    .from("document_versions")
    .select("version")
    .eq("document_id", documentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version ?? 0) + 1;

  await supabase.from("document_versions").insert({
    document_id: documentId,
    owner_id: doc.owner_id,
    version: nextVersion,
    content: content as unknown as Record<string, unknown>,
  });
}

export async function listDocumentVersions(
  supabase: SupabaseClient<Database>,
  documentId: string,
) {
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function restoreDocumentVersion(
  supabase: SupabaseClient<Database>,
  documentId: string,
  versionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { data: version, error } = await supabase
    .from("document_versions")
    .select("content")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .single();
  if (error || !version) return { ok: false, message: "Versi tidak ditemukan." };

  const result = await autosaveDocument(
    supabase,
    documentId,
    version.content as unknown as DocumentContent,
  );
  return result.ok ? { ok: true } : { ok: false, message: result.message };
}

/** Archiving/deleting is always an explicit, visible user action (section 05). */
export async function archiveDocument(
  supabase: SupabaseClient<Database>,
  documentId: string,
): Promise<void> {
  await supabase
    .from("documents")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", documentId);
}

export async function deleteDocument(
  supabase: SupabaseClient<Database>,
  documentId: string,
): Promise<void> {
  await supabase.from("documents").delete().eq("id", documentId);
}

export async function markDocumentCompleted(
  supabase: SupabaseClient<Database>,
  documentId: string,
): Promise<void> {
  await supabase.from("documents").update({ status: "completed" }).eq("id", documentId);
}
