"use client";

import { EditorContent, BubbleMenu, type Editor } from "@tiptap/react";
import { AiAssistToolbar } from "./ai-assist-toolbar";
import type { InlineAssistAction } from "@/lib/ai/inline-assist";

export function DocumentEditor({
  editor,
  onAssistAction,
  assistBusy,
}: {
  editor: Editor | null;
  onAssistAction: (action: InlineAssistAction, range: { from: number; to: number }, selectedText: string) => void;
  assistBusy: boolean;
}) {
  if (!editor) return null;

  return (
    <>
      <BubbleMenu editor={editor} shouldShow={({ state }) => !state.selection.empty}>
        <AiAssistToolbar
          busy={assistBusy}
          onAction={(action) => {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            onAssistAction(action, { from, to }, selectedText);
          }}
        />
      </BubbleMenu>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none rounded-md border bg-card p-6 focus-within:ring-2 focus-within:ring-ring"
      />
    </>
  );
}
