"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentEditor } from "./editor";
import { PreviewA4 } from "./preview-a4";
import { ExportMenu } from "./export-menu";
import { AutosaveIndicator, type AutosaveStatus } from "./autosave-indicator";
import type { DocumentRecord } from "@/types/document";
import type { InlineAssistAction } from "@/lib/ai/inline-assist";

const AUTOSAVE_DEBOUNCE_MS = 1200;

export function DocumentWorkspace({ document }: { document: DocumentRecord }) {
  const [title, setTitle] = useState(document.title);
  const [previewHtml, setPreviewHtml] = useState(document.content.html);
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(document.updatedAt);
  const [assistBusy, setAssistBusy] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Mulai menulis atau edit draf AI di sini..." }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: document.content.html,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setPreviewHtml(html);
      scheduleAutosave(html);
    },
  });

  function scheduleAutosave(html: string) {
    setStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void autosave(html), AUTOSAVE_DEBOUNCE_MS);
  }

  async function autosave(html: string) {
    try {
      const res = await fetch(`/api/documents/${document.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSavedAt(data.savedAt);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function handleTitleBlur() {
    if (title === document.title) return;
    await fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  }

  async function handleAssistAction(
    action: InlineAssistAction,
    range: { from: number; to: number },
    selectedText: string,
  ) {
    if (!editor) return;
    setAssistBusy(true);
    setAssistError(null);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, selectedText, documentId: document.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssistError(data.message ?? "AI Assist gagal. Teks Anda tidak berubah.");
        return;
      }
      editor.chain().focus().insertContentAt(range, data.text).run();
      scheduleAutosave(editor.getHTML());
    } catch {
      setAssistError("Gagal terhubung ke server. Teks Anda tidak berubah.");
    } finally {
      setAssistBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-72 border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <Badge variant={document.status === "completed" ? "success" : "default"}>
            {document.status === "draft" ? "Draf" : document.status === "completed" ? "Selesai" : "Diarsipkan"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator status={status} savedAt={savedAt} />
          <ExportMenu documentId={document.id} />
        </div>
      </div>

      {assistError ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{assistError}</p>
      ) : null}

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <DocumentEditor editor={editor} onAssistAction={handleAssistAction} assistBusy={assistBusy} />
        </TabsContent>
        <TabsContent value="preview">
          <PreviewA4 title={title} html={previewHtml} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
