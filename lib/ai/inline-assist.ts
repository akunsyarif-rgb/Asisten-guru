import { getModelAdapter } from "./provider";
import { SYSTEM_RULES } from "@/lib/prompts/system-rules";

export type InlineAssistAction =
  | "perbaiki"
  | "ringkas"
  | "kembangkan"
  | "formalkan"
  | "sesuaikan"
  | "regenerate";

export const INLINE_ASSIST_LABELS: Record<InlineAssistAction, string> = {
  perbaiki: "Perbaiki",
  ringkas: "Ringkas",
  kembangkan: "Kembangkan",
  formalkan: "Formalkan",
  sesuaikan: "Sesuaikan",
  regenerate: "Regenerate",
};

const ACTION_INSTRUCTIONS: Record<InlineAssistAction, string> = {
  perbaiki:
    "Perbaiki tata bahasa dan kejelasan kalimat berikut tanpa mengubah makna atau menambah informasi baru.",
  ringkas: "Ringkas teks berikut tanpa menghilangkan informasi penting dan tanpa menambah klaim baru.",
  kembangkan:
    "Kembangkan teks berikut menjadi lebih rinci HANYA dengan merapikan struktur dan bahasa. Jangan menambahkan aktivitas, fakta, atau data baru yang tidak ada pada teks asli.",
  formalkan: "Ubah gaya bahasa teks berikut menjadi lebih formal dan sesuai kaidah pedagogis.",
  sesuaikan:
    "Sesuaikan gaya bahasa teks berikut agar lebih selaras dengan konteks dokumen yang diberikan, tanpa mengarang data baru.",
  regenerate:
    "Susun ulang teks berikut dengan struktur dan bahasa yang lebih baik, tanpa mengubah maksud atau menambah informasi baru.",
};

export type InlineAssistResult = { ok: true; text: string } | { ok: false; message: string };

/**
 * Inline AI Assist (blueprint section 21): operates ONLY on the selected
 * text the caller passes in — never the whole document — and is bound by
 * the same Factuality Lock as full generation.
 */
export async function runInlineAssist(
  action: InlineAssistAction,
  selectedText: string,
  documentContext: Record<string, unknown>,
): Promise<InlineAssistResult> {
  if (!selectedText.trim()) {
    return { ok: false, message: "Pilih teks terlebih dahulu." };
  }

  const adapter = getModelAdapter();
  const userPrompt = `INLINE_ASSIST_TASK
${ACTION_INSTRUCTIONS[action]}

TEKS TERPILIH:
"""
${selectedText}
"""

KONTEKS DOKUMEN (hanya untuk keselarasan gaya, BUKAN sumber fakta baru):
${JSON.stringify(documentContext)}

Kembalikan JSON persis dengan bentuk: {"text": string}`;

  const result = await adapter.complete({ systemPrompt: SYSTEM_RULES, userPrompt, temperature: 0.3 });

  try {
    const parsed = JSON.parse(stripCodeFence(result.text.trim()));
    if (typeof parsed.text === "string" && parsed.text.trim().length > 0) {
      return { ok: true, text: parsed.text };
    }
    return { ok: false, message: "Respons AI tidak berisi teks yang valid." };
  } catch {
    return { ok: false, message: "Respons AI bukan JSON yang valid." };
  }
}

function stripCodeFence(text: string): string {
  const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return match ? (match[1] ?? text) : text;
}
