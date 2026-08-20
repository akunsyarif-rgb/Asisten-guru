import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const kisiKisiDefinition: ModuleDefinition = {
  id: "kisi-kisi",
  name: "Kisi-Kisi",
  description: "Kisi-kisi soal yang memetakan indikator ke bentuk asesmen.",
  requiredContext: ["dataPembelajaran", "asesmen"],
  dependencies: ["asesmen"],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun Kisi-Kisi yang memetakan materi dan tujuan pembelajaran ke instrumen
Asesmen yang sudah dibuat (lihat dependencyOutputs.asesmen). Gunakan format tabel: indikator, bentuk soal,
jumlah butir.

Data guru:
${describeContext(context)}`,
};
