import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/service";
import { PrintTrigger } from "./print-trigger";

/**
 * Standalone print view for manual PDF export (blueprint section 23).
 * Deliberately outside the app shell — nothing but the A4 page itself
 * should print. See lib/export/pdf.ts for why this uses the browser's
 * native print-to-PDF instead of a server-rendered binary.
 */
export default async function PrintDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const document = await getDocument(supabase, id);
  if (!document) notFound();

  return (
    <div className="bg-muted py-8 print:bg-white print:py-0">
      <div className="a4-page">
        <h1 className="mb-4 text-xl font-semibold">{document.title}</h1>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: document.content.html }}
        />
      </div>
      <PrintTrigger />
    </div>
  );
}
