import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/service";
import { DocumentWorkspace } from "@/components/workspace/document-workspace";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const document = await getDocument(supabase, id);
  if (!document) notFound();

  return <DocumentWorkspace document={document} />;
}
