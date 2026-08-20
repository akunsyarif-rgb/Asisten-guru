import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { wizardFormSchema } from "@/schemas/context.schema";
import { buildContextObject } from "@/lib/context/engine";
import { runGenerationJob } from "@/lib/generation/orchestrator";
import { getModule } from "@/modules/registry";
import { aiConfig } from "@/config/ai";
import type { ModuleId } from "@/types/module";

/**
 * Creates a generation job + its items, then runs the orchestrator
 * (blueprint sections 13-14). Rate limiting per section 24: a teacher
 * cannot start more than `rateLimitPerHour` jobs in a rolling hour.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Anda harus masuk untuk membuat dokumen." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = wizardFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data wizard tidak valid.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= aiConfig.rateLimitPerHour) {
    return NextResponse.json(
      { message: "Batas jumlah generate per jam tercapai. Coba lagi nanti." },
      { status: 429 },
    );
  }

  const contextResult = buildContextObject(parsed.data);
  if (!contextResult.ok) {
    return NextResponse.json(
      { message: "Data tidak lengkap untuk membentuk konteks.", issues: contextResult.issues },
      { status: 400 },
    );
  }

  const { data: jobRow, error: jobError } = await supabase
    .from("generation_jobs")
    .insert({
      owner_id: user.id,
      status: "queued",
      wizard_input: parsed.data,
      context: contextResult.context as unknown as Record<string, unknown>,
      preset: parsed.data.preset,
    })
    .select("id")
    .single();

  if (jobError || !jobRow) {
    console.error("Failed to insert generation_jobs row:", jobError);
    return NextResponse.json({ message: "Gagal membuat generation job." }, { status: 500 });
  }

  const moduleIds = parsed.data.selectedModules as ModuleId[];
  const itemRows = moduleIds.map((moduleId) => {
    const moduleDef = getModule(moduleId);
    return {
      job_id: jobRow.id,
      owner_id: user.id,
      module_id: moduleId,
      status: "idle" as const,
      depends_on: moduleDef.dependencies,
    };
  });

  const { error: itemsError } = await supabase.from("generation_items").insert(itemRows);
  if (itemsError) {
    console.error("Failed to insert generation_items rows:", itemsError);
    return NextResponse.json({ message: "Gagal membuat generation items." }, { status: 500 });
  }

  try {
    await runGenerationJob(supabase, jobRow.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat generate.";
    await supabase
      .from("generation_jobs")
      .update({ status: "failed", error_message: message })
      .eq("id", jobRow.id);
  }

  return NextResponse.json({ jobId: jobRow.id });
}
