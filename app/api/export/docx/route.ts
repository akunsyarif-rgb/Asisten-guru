import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/service";
import { htmlToDocxBuffer } from "@/lib/export/docx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ message: "documentId wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const document = await getDocument(supabase, documentId);
  if (!document) return NextResponse.json({ message: "Dokumen tidak ditemukan." }, { status: 404 });

  const buffer = await htmlToDocxBuffer(document.title, document.content.html);
  const filename = `${document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
