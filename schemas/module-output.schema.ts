import { z } from "zod";

/**
 * Generic output contract every module's AI response must satisfy before it
 * reaches the editor (blueprint section 10 & 11). Modules may extend this
 * with extra structured fields, but `html` + `placeholders` are universal.
 */
export const moduleOutputSchema = z.object({
  title: z.string().trim().min(1),
  html: z.string().trim().min(1),
  sections: z
    .array(
      z.object({
        id: z.string(),
        heading: z.string(),
        html: z.string(),
      }),
    )
    .optional(),
  /** Any "[Perlu dilengkapi: ...]" markers the model inserted (section 09). */
  placeholders: z.array(z.string()).default([]),
});

export type ModuleOutput = z.infer<typeof moduleOutputSchema>;
