"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Export is always a manual, explicit action (blueprint section 23) —
 * generating a document never auto-downloads anything.
 */
export function ExportMenu({ documentId }: { documentId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/api/export/docx?documentId=${documentId}`}>Unduh DOCX</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/documents/${documentId}/print`} target="_blank" rel="noopener noreferrer">
            <Printer className="mr-2 inline h-4 w-4" />
            Cetak / Simpan sebagai PDF
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
