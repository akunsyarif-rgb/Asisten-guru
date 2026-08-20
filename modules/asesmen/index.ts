import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const asesmenDefinition: ModuleDefinition = {
  id: "asesmen",
  name: "Asesmen",
  description: "Instrumen asesmen sesuai bentuk yang dipilih guru.",
  requiredContext: ["dataPembelajaran", "pembelajaran", "asesmen"],
  dependencies: [],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun instrumen Asesmen sesuai bentuk asesmen yang dipilih guru. Turunkan
soal/instrumen dari tujuan pembelajaran dan materi yang diberikan. Jangan mengarang hasil belajar atau
data peserta didik.

Data guru:
${describeContext(context)}`,
};
