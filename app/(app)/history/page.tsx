import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { mapJobRow } from "@/lib/generation/mappers";
import { formatRelativeTime } from "@/lib/utils";
import type { GenerationJobStatus } from "@/types/generation";

const statusLabel: Record<GenerationJobStatus, string> = {
  queued: "Menunggu",
  running: "Sedang berjalan",
  completed: "Selesai",
  partial: "Sebagian selesai",
  failed: "Gagal",
  cancelled: "Dibatalkan",
};

const statusVariant: Record<GenerationJobStatus, "default" | "success" | "warning" | "destructive"> = {
  queued: "default",
  running: "default",
  completed: "success",
  partial: "warning",
  failed: "destructive",
  cancelled: "default",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: jobRows } = await supabase
    .from("generation_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  const jobs = (jobRows ?? []).map(mapJobRow);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Riwayat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Riwayat proses pembuatan perangkat pembelajaran.</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada riwayat generate.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/wizard/${job.id}`}>
              <Card className="transition-colors hover:border-accent">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">
                      {job.context.dataPembelajaran?.materi || "Perangkat pembelajaran"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.preset ?? "custom"} · {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusVariant[job.status]}>{statusLabel[job.status]}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
