import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const lkpdDefinition: ModuleDefinition = {
  id: "lkpd",
  name: "LKPD",
  description: "Lembar Kerja Peserta Didik yang selaras dengan tujuan dan aktivitas pembelajaran.",
  requiredContext: ["dataPembelajaran", "pembelajaran"],
  dependencies: [],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun Lembar Kerja Peserta Didik (LKPD) yang selaras dengan tujuan
pembelajaran dan aktivitas yang diberikan guru. Sertakan petunjuk pengerjaan singkat dan ruang kerja
peserta didik yang sesuai dengan materi. Jangan menambahkan soal atau aktivitas yang tidak berdasar dari
data guru.

Data guru:
${describeContext(context)}`,
};
