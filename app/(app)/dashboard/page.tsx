import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/documents/service";

/**
 * Dashboard is a "Ruang Transit" (transit space), not an analytics
 * dashboard (blueprint section 15). No vanity metrics, token usage, or
 * productivity scores — just a way back into recent work and a clear way
 * to start something new.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const recentDocuments = await listDocuments(supabase, { limit: 6 });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Beranda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Susun perangkat pembelajaran baru atau lanjutkan yang sedang dikerjakan.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/wizard">
            <Plus className="h-4 w-4" />
            Buat Perangkat Pembelajaran
          </Link>
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Terakhir Dikerjakan</h2>
        <RecentDocuments documents={recentDocuments} />
      </section>
    </div>
  );
}
