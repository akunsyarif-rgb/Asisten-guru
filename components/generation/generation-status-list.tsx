"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerationStatusIcon, generationStatusLabel } from "@/components/ui/progress-status";
import { getModule } from "@/modules/registry";
import type { GenerationItemRecord, GenerationJobRecord } from "@/types/generation";

const TERMINAL_JOB_STATUSES = new Set(["completed", "partial", "failed", "cancelled"]);
const POLL_INTERVAL_MS = 2000;

export function GenerationStatusList({
  jobId,
  initialJob,
  initialItems,
}: {
  jobId: string;
  initialJob: GenerationJobRecord;
  initialItems: GenerationItemRecord[];
}) {
  const [job, setJob] = useState(initialJob);
  const [items, setItems] = useState(initialItems);
  const [retrying, setRetrying] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (TERMINAL_JOB_STATUSES.has(job.status)) return;

    intervalRef.current = setInterval(async () => {
      const res = await fetch(`/api/generate/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      setJob(data.job);
      setItems(data.items);
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [job.status, jobId]);

  async function retryItem(itemId: string) {
    setRetrying(itemId);
    try {
      await fetch(`/api/generate/${jobId}/items/${itemId}/retry`, { method: "POST" });
      const res = await fetch(`/api/generate/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        setItems(data.items);
      }
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const moduleDef = getModule(item.moduleId);
        return (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3">
                <GenerationStatusIcon status={item.status} />
                <div>
                  <p className="text-sm font-medium">{moduleDef.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {generationStatusLabel(item.status)}
                    {item.status === "error" && item.errorMessage ? ` — ${item.errorMessage}` : ""}
                    {item.status === "warning" && item.warningMessage ? ` — ${item.warningMessage}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.status === "error" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryItem(item.id)}
                    disabled={retrying === item.id}
                  >
                    <RotateCw className={retrying === item.id ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                    Coba Lagi
                  </Button>
                ) : null}
                {(item.status === "completed" || item.status === "warning") && item.documentId ? (
                  <Button size="sm" asChild>
                    <Link href={`/documents/${item.documentId}`}>Buka</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {TERMINAL_JOB_STATUSES.has(job.status) ? (
        <p className="text-sm text-muted-foreground">
          {job.status === "completed" && "Semua dokumen berhasil dibuat."}
          {job.status === "partial" && "Sebagian dokumen berhasil dibuat. Anda dapat mencoba lagi item yang gagal."}
          {job.status === "failed" && (job.errorMessage ?? "Generate gagal. Data Anda tetap tersimpan.")}
          {job.status === "cancelled" && "Job dibatalkan."}
        </p>
      ) : null}
    </div>
  );
}
