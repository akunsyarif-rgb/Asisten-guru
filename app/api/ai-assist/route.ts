import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runInlineAssist, type InlineAssistAction } from "@/lib/ai/inline-assist";
import { validateContent } from "@/lib/validation/content-validator";

const VALID_ACTIONS: InlineAssistAction[] = [
  "perbaiki",
  "ringkas",
  "kembangkan",
  "formalkan",
  "sesuaikan",
  "regenerate",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action as InlineAssistAction;
  const selectedText = typeof body?.selectedText === "string" ? body.selectedText : "";
  const documentId = typeof body?.documentId === "string" ? body.documentId : null;

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ message: "Aksi tidak dikenali." }, { status: 400 });
  }

  let documentContext: Record<string, unknown> = {};
  if (documentId) {
    const { data: doc } = await supabase
      .from("documents")
      .select("context")
      .eq("id", documentId)
      .single();
    documentContext = doc?.context ?? {};
  }

  const result = await runInlineAssist(action, selectedText, documentContext);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 422 });
  }

  const { sanitizedHtml } = validateContent(result.text);
  return NextResponse.json({ text: sanitizedHtml });
}
