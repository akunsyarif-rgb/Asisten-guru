import type { ModuleId } from "@/types/module";

/** Wizard presets (blueprint section 18). */
export const modulePresets: Record<"lengkap" | "perangkat-inti" | "custom", ModuleId[]> = {
  lengkap: [
    "modul-ajar",
    "lkpd",
    "asesmen",
    "rubrik",
    "bahan-ajar",
    "kisi-kisi",
    "remedial-pengayaan",
  ],
  "perangkat-inti": ["modul-ajar", "lkpd", "asesmen"],
  custom: [],
};

export const navItems = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/wizard", label: "Perangkat Pembelajaran" },
  { href: "/documents", label: "Dokumen" },
  { href: "/history", label: "Riwayat" },
  { href: "/templates", label: "Template" },
  { href: "/settings", label: "Pengaturan" },
] as const;
