import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autosaveDocument } from "@/lib/documents/service";
import { validateContent } from "@/lib/validation/content-validator";

/**
 * Debounced autosave endpoint (blueprint section 20/27). The caller
 * debounces on the client; every call here is a single atomic save plus
 * version snapshot.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (typeof body?.html !== "string") {
    return NextResponse.json({ message: "Konten tidak valid." }, { status: 400 });
  }

  const { sanitizedHtml } = validateContent(body.html);
  const result = await autosaveDocument(supabase, id, { html: sanitizedHtml });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
  return NextResponse.json({ savedAt: result.savedAt });
}
