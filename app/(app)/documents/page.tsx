import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/documents/service";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: "draft" | "completed" | "archived" }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const documents = await listDocuments(supabase, { status });

  const filters: Array<{ label: string; value?: "draft" | "completed" | "archived" }> = [
    { label: "Semua" },
    { label: "Draf", value: "draft" },
    { label: "Selesai", value: "completed" },
    { label: "Diarsipkan", value: "archived" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dokumen</h1>
        <Button asChild>
          <Link href="/wizard">
            <Plus className="h-4 w-4" />
            Buat Perangkat Pembelajaran
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {filters.map((filter) => (
          <Button key={filter.label} asChild variant={status === filter.value ? "default" : "outline"} size="sm">
            <Link href={filter.value ? `/documents?status=${filter.value}` : "/documents"}>{filter.label}</Link>
          </Button>
        ))}
      </div>

      <RecentDocuments documents={documents} />
    </div>
  );
}
