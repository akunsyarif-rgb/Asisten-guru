import { z } from "zod";
import type { ModuleDefinition } from "@/types/module";
import { describeContext } from "../shared";

export const remedialPengayaanDefinition: ModuleDefinition = {
  id: "remedial-pengayaan",
  name: "Remedial & Pengayaan",
  description: "Rencana remedial dan pengayaan berdasarkan hasil Asesmen.",
  requiredContext: ["asesmen"],
  dependencies: ["asesmen"],
  version: 1,
  outputSchema: z.object({
    title: z.string(),
    html: z.string(),
    placeholders: z.array(z.string()).default([]),
  }),
  buildTaskPrompt: (context) => `Susun rencana Remedial dan Pengayaan berdasarkan bentuk asesmen dan
catatan remedial/pengayaan yang diberikan guru, serta hasil Asesmen yang telah dibuat (lihat
dependencyOutputs.asesmen). Jangan mengarang data hasil belajar peserta didik yang belum ada.

Data guru:
${describeContext(context)}`,
};
