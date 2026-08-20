import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapItemRow, mapJobRow } from "@/lib/generation/mappers";

/** Polled by the generation status UI (blueprint section 14). */
export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: jobRow, error: jobError } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (jobError || !jobRow) {
    return NextResponse.json({ message: "Job tidak ditemukan." }, { status: 404 });
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("generation_items")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  if (itemsError || !itemRows) {
    return NextResponse.json({ message: "Gagal memuat status generation." }, { status: 500 });
  }

  return NextResponse.json({
    job: mapJobRow(jobRow),
    items: itemRows.map(mapItemRow),
  });
}
