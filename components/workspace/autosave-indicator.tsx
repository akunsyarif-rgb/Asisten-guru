import { formatRelativeTime } from "@/lib/utils";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function AutosaveIndicator({ status, savedAt }: { status: AutosaveStatus; savedAt: string | null }) {
  if (status === "saving") {
    return <p className="text-xs text-muted-foreground">Menyimpan...</p>;
  }
  if (status === "error") {
    return <p className="text-xs text-destructive">Gagal menyimpan otomatis. Perubahan tetap ada di editor.</p>;
  }
  if (status === "saved" && savedAt) {
    return <p className="text-xs text-muted-foreground">Tersimpan otomatis · {formatRelativeTime(savedAt)}</p>;
  }
  return <p className="text-xs text-muted-foreground">&nbsp;</p>;
}
