import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapItemRow, mapJobRow } from "@/lib/generation/mappers";
import { runItem, getDependencyOutputsForItem, summarizeJobStatus } from "@/lib/generation/orchestrator";

/**
 * Retries a single failed generation item without touching the rest of the
 * job or asking the teacher to refill the wizard (blueprint section 26:
 * error messages must be actionable and never discard input).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string; itemId: string }> },
) {
  const { jobId, itemId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { data: jobRow } = await supabase.from("generation_jobs").select("*").eq("id", jobId).single();
  if (!jobRow) return NextResponse.json({ message: "Job tidak ditemukan." }, { status: 404 });

  const { data: itemRow } = await supabase
    .from("generation_items")
    .select("*")
    .eq("id", itemId)
    .eq("job_id", jobId)
    .single();
  if (!itemRow) return NextResponse.json({ message: "Item tidak ditemukan." }, { status: 404 });

  const item = mapItemRow(itemRow);
  if (item.status !== "error") {
    return NextResponse.json({ message: "Hanya item yang gagal dapat dicoba ulang." }, { status: 400 });
  }

  const job = mapJobRow(jobRow);
  const dependencyOutputs = await getDependencyOutputsForItem(supabase, jobId, item.dependsOn);

  await runItem(supabase, item, job.context, dependencyOutputs);

  const { data: allItemRows } = await supabase.from("generation_items").select("*").eq("job_id", jobId);
  const allItems = (allItemRows ?? []).map(mapItemRow);
  await supabase
    .from("generation_jobs")
    .update({ status: summarizeJobStatus(allItems) })
    .eq("id", jobId);

  return NextResponse.json({ ok: true });
}
