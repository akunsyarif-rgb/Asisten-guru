import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapItemRow, mapJobRow } from "@/lib/generation/mappers";
import { GenerationStatusList } from "@/components/generation/generation-status-list";

/**
 * Progressive Generation view (blueprint section 14): shows real-time,
 * icon-based status per document — never a fabricated percentage — and
 * lets the teacher open anything that's already done without waiting for
 * the rest of the batch.
 */
export default async function GenerationStatusPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createClient();

  const { data: jobRow } = await supabase.from("generation_jobs").select("*").eq("id", jobId).single();
  if (!jobRow) notFound();

  const { data: itemRows } = await supabase
    .from("generation_items")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Menyusun Dokumen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dokumen yang sudah selesai bisa langsung dibuka tanpa menunggu yang lain.
        </p>
      </div>
      <GenerationStatusList
        jobId={jobId}
        initialJob={mapJobRow(jobRow)}
        initialItems={(itemRows ?? []).map(mapItemRow)}
      />
    </div>
  );
}
