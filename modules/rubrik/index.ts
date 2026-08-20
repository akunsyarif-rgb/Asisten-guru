import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const rubrikDefinition: ModuleDefinition = {
  id: "rubrik",
  name: "Rubrik",
  description: "Rubrik penilaian yang diturunkan dari instrumen Asesmen.",
  requiredContext: ["asesmen"],
  // Depends on Asesmen output — the orchestrator must generate Asesmen first
  // (blueprint section 13: "Jangan membuat Rubrik sebelum konteks Asesmen tersedia").
  dependencies: ["asesmen"],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun Rubrik penilaian berdasarkan instrumen Asesmen yang telah dibuat
(lihat dependencyOutputs.asesmen). Buat kriteria dan level capaian yang konsisten dengan asesmen tersebut.
Jika konteks Asesmen belum tersedia, gunakan placeholder alih-alih mengarang kriteria.

Data guru:
${describeContext(context)}`,
};
