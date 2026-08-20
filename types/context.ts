/** Tahap 01 — Data Pembelajaran */
export interface DataPembelajaran {
  mapel: string;
  faseKelas: string;
  materi: string;
  alokasiWaktu: string;
  kompetensiAwal?: string;
}

/** Tahap 02 — Pembelajaran */
export interface Pembelajaran {
  tujuanPembelajaran: string;
  targetHasilBelajar?: string;
  metodeModel: string;
  aktivitas?: string;
  sarana?: string;
}

/** Tahap 03 — Asesmen */
export interface AsesmenInput {
  bentukAsesmen: string;
  instrumen?: string;
  remedial?: string;
  pengayaan?: string;
}

export type WizardPreset = "lengkap" | "perangkat-inti" | "custom";

/** Raw form state collected across the four wizard steps. */
export interface WizardFormState {
  dataPembelajaran: DataPembelajaran;
  pembelajaran: Pembelajaran;
  asesmen: AsesmenInput;
  selectedModules: string[];
  preset: WizardPreset;
}

/**
 * The normalized, validated Context Object produced by the Context Engine
 * (blueprint section 08). This is what modules receive — filtered down to
 * only the keys each module declares in `requiredContext`.
 */
export interface ContextObject {
  dataPembelajaran: DataPembelajaran;
  pembelajaran: Pembelajaran;
  asesmen: AsesmenInput;
  /** Populated by the orchestrator once dependency modules complete. */
  dependencyOutputs?: Record<string, unknown>;
}
