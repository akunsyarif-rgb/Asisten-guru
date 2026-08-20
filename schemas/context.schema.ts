import { z } from "zod";

/**
 * Validates the raw wizard form before it becomes a Context Object.
 * Context Engine step 2/5: Normalize -> Validate (blueprint section 08).
 */
export const dataPembelajaranSchema = z.object({
  mapel: z.string().trim().min(1, "Mata pelajaran wajib diisi"),
  faseKelas: z.string().trim().min(1, "Fase/kelas wajib diisi"),
  materi: z.string().trim().min(1, "Materi wajib diisi"),
  alokasiWaktu: z.string().trim().min(1, "Alokasi waktu wajib diisi"),
  kompetensiAwal: z.string().trim().optional(),
});

export const pembelajaranSchema = z.object({
  tujuanPembelajaran: z.string().trim().min(1, "Tujuan pembelajaran wajib diisi"),
  targetHasilBelajar: z.string().trim().optional(),
  metodeModel: z.string().trim().min(1, "Metode/model wajib diisi"),
  aktivitas: z.string().trim().optional(),
  sarana: z.string().trim().optional(),
});

export const asesmenInputSchema = z.object({
  bentukAsesmen: z.string().trim().min(1, "Bentuk asesmen wajib diisi"),
  instrumen: z.string().trim().optional(),
  remedial: z.string().trim().optional(),
  pengayaan: z.string().trim().optional(),
});

export const wizardPresetSchema = z.enum(["lengkap", "perangkat-inti", "custom"]);

export const wizardFormSchema = z.object({
  dataPembelajaran: dataPembelajaranSchema,
  pembelajaran: pembelajaranSchema,
  asesmen: asesmenInputSchema,
  selectedModules: z.array(z.string()).min(1, "Pilih minimal satu dokumen"),
  preset: wizardPresetSchema,
});

export const contextObjectSchema = z.object({
  dataPembelajaran: dataPembelajaranSchema,
  pembelajaran: pembelajaranSchema,
  asesmen: asesmenInputSchema,
  dependencyOutputs: z.record(z.unknown()).optional(),
});
