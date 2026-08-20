import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  archiveDocument,
  deleteDocument,
  getDocument,
  markDocumentCompleted,
} from "@/lib/documents/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const document = await getDocument(supabase, id);
  if (!document) return NextResponse.json({ message: "Dokumen tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ document });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);

  if (body?.title && typeof body.title === "string") {
    await supabase.from("documents").update({ title: body.title }).eq("id", id);
  }
  if (body?.status === "completed") {
    await markDocumentCompleted(supabase, id);
  }
  if (body?.status === "archived") {
    await archiveDocument(supabase, id);
  }
  if (body?.status === "draft") {
    await supabase.from("documents").update({ status: "draft", archived_at: null }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await deleteDocument(supabase, id);
  return NextResponse.json({ ok: true });
}
