import { Check, CircleDashed, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerationItemStatus } from "@/types/generation";

/**
 * Status icon set mandated by blueprint section 14 (Progressive Generation):
 * done / generating / queued / warning / error — deliberately never a
 * percentage, since the backend has no real progress fraction to report.
 */
const STATUS_MAP: Record<
  GenerationItemStatus,
  { icon: React.ElementType; label: string; className: string; spin?: boolean }
> = {
  idle: { icon: CircleDashed, label: "Menunggu", className: "text-muted-foreground" },
  queued: { icon: CircleDashed, label: "Menunggu", className: "text-muted-foreground" },
  generating: { icon: Loader2, label: "Sedang menyusun", className: "text-accent", spin: true },
  validating: { icon: Loader2, label: "Memvalidasi", className: "text-accent", spin: true },
  completed: { icon: Check, label: "Selesai", className: "text-success" },
  warning: { icon: TriangleAlert, label: "Perlu diperiksa", className: "text-warning" },
  error: { icon: X, label: "Gagal", className: "text-destructive" },
  cancelled: { icon: X, label: "Dibatalkan", className: "text-muted-foreground" },
};

export function GenerationStatusIcon({
  status,
  className,
}: {
  status: GenerationItemStatus;
  className?: string;
}) {
  const entry = STATUS_MAP[status];
  const Icon = entry.icon;
  return (
    <Icon
      className={cn("h-4 w-4", entry.className, entry.spin && "animate-spin", className)}
      aria-label={entry.label}
    />
  );
}

export function generationStatusLabel(status: GenerationItemStatus): string {
  return STATUS_MAP[status].label;
}
