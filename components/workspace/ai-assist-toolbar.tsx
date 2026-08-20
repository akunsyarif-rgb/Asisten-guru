import { Button } from "@/components/ui/button";
import { INLINE_ASSIST_LABELS, type InlineAssistAction } from "@/lib/ai/inline-assist";

const ACTIONS: InlineAssistAction[] = [
  "perbaiki",
  "ringkas",
  "kembangkan",
  "formalkan",
  "sesuaikan",
  "regenerate",
];

/**
 * Selection-based AI Assist toolbar (blueprint section 21). Rendered inside
 * a TipTap BubbleMenu — only appears when the teacher has selected text,
 * and every action here operates on that selection alone.
 */
export function AiAssistToolbar({
  onAction,
  busy,
}: {
  onAction: (action: InlineAssistAction) => void;
  busy: boolean;
}) {
  return (
    <div className="flex gap-1 rounded-md border bg-popover p-1 shadow-md">
      {ACTIONS.map((action) => (
        <Button
          key={action}
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => onAction(action)}
        >
          {INLINE_ASSIST_LABELS[action]}
        </Button>
      ))}
    </div>
  );
}
