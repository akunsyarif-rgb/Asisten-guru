import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { getModule } from "@/modules/registry";
import type { DocumentRecord } from "@/types/document";

const statusLabel: Record<DocumentRecord["status"], string> = {
  draft: "Draf",
  completed: "Selesai",
  archived: "Diarsipkan",
};

export function RecentDocuments({ documents }: { documents: DocumentRecord[] }) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Belum ada dokumen. Mulai dengan membuat perangkat pembelajaran pertama Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/documents/${doc.id}`}>
          <Card className="h-full transition-colors hover:border-accent">
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-medium">{doc.title}</p>
                <Badge variant={doc.status === "completed" ? "success" : "default"}>
                  {statusLabel[doc.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getModule(doc.moduleId).name} · Terakhir diubah {formatRelativeTime(doc.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
