import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const bahanAjarDefinition: ModuleDefinition = {
  id: "bahan-ajar",
  name: "Bahan Ajar",
  description: "Materi ringkas untuk mendukung penyampaian pembelajaran.",
  requiredContext: ["dataPembelajaran", "pembelajaran"],
  dependencies: [],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun ringkasan Bahan Ajar untuk materi yang diberikan guru, disusun agar
mudah disampaikan sesuai metode/model pembelajaran yang dipilih. Jangan menambahkan sub-topik yang
tidak berkaitan dengan materi yang diberikan.

Data guru:
${describeContext(context)}`,
};
