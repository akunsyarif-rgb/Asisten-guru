import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const modulAjarDefinition: ModuleDefinition = {
  id: "modul-ajar",
  name: "Modul Ajar",
  description: "Rencana pembelajaran lengkap: identitas, tujuan, langkah kegiatan, dan asesmen ringkas.",
  requiredContext: ["dataPembelajaran", "pembelajaran", "asesmen"],
  dependencies: [],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun Modul Ajar berdasarkan data berikut. Sertakan bagian: Identitas
(mapel, fase/kelas, alokasi waktu), Tujuan Pembelajaran, Langkah Kegiatan (pembuka, inti, penutup) yang
diturunkan dari metode/model dan aktivitas yang diberikan guru, serta ringkasan Asesmen. Jangan
menambahkan aktivitas atau sarana yang tidak disebutkan guru.

Data guru:
${describeContext(context)}`,
};
