"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  dataPembelajaranSchema,
  pembelajaranSchema,
  asesmenInputSchema,
} from "@/schemas/context.schema";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
  type WizardDraft,
} from "@/lib/wizard/draft-storage";
import { modulePresets } from "@/config/modules";
import type { WizardFormState } from "@/types/context";
import { StepDataPembelajaran } from "./step-data-pembelajaran";
import { StepPembelajaran } from "./step-pembelajaran";
import { StepAsesmen } from "./step-asesmen";
import { StepDokumen } from "./step-dokumen";

const STEP_LABELS = ["Data Pembelajaran", "Pembelajaran", "Asesmen", "Dokumen"];

const emptyForm: WizardFormState = {
  dataPembelajaran: { mapel: "", faseKelas: "", materi: "", alokasiWaktu: "", kompetensiAwal: "" },
  pembelajaran: { tujuanPembelajaran: "", targetHasilBelajar: "", metodeModel: "", aktivitas: "", sarana: "" },
  asesmen: { bentukAsesmen: "", instrumen: "", remedial: "", pengayaan: "" },
  selectedModules: modulePresets["perangkat-inti"],
  preset: "perangkat-inti",
};

export function WizardShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<WizardDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hydratedFromDraft = useRef(false);

  useEffect(() => {
    const existing = loadWizardDraft();
    if (existing) setDraft(existing);
  }, []);

  useEffect(() => {
    if (!hydratedFromDraft.current) return;
    saveWizardDraft({ form, step });
  }, [form, step]);

  function resumeDraft() {
    if (!draft) return;
    setForm(draft.form);
    setStep(draft.step);
    hydratedFromDraft.current = true;
    setDraft(null);
  }

  function discardDraft() {
    clearWizardDraft();
    setDraft(null);
    hydratedFromDraft.current = true;
  }

  function validateStep(current: number): boolean {
    if (current === 0) {
      const result = dataPembelajaranSchema.safeParse(form.dataPembelajaran);
      setErrors(toErrorMap(result));
      return result.success;
    }
    if (current === 1) {
      const result = pembelajaranSchema.safeParse(form.pembelajaran);
      setErrors(toErrorMap(result));
      return result.success;
    }
    if (current === 2) {
      const result = asesmenInputSchema.safeParse(form.asesmen);
      setErrors(toErrorMap(result));
      return result.success;
    }
    if (form.selectedModules.length === 0) {
      setErrors({ selectedModules: "Pilih minimal satu dokumen" });
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    hydratedFromDraft.current = true;
    if (!validateStep(step)) return;
    if (step < STEP_LABELS.length - 1) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function submit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.message ?? "Gagal memulai generate. Data Anda tetap tersimpan.");
        return;
      }
      clearWizardDraft();
      router.push(`/wizard/${data.jobId}`);
    } catch {
      setSubmitError("Gagal terhubung ke server. Data Anda tetap tersimpan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {draft ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted px-4 py-3 text-sm">
          <span>
            Draf wizard — Terakhir disimpan {formatRelativeTime(draft.savedAt)}
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={resumeDraft}>Lanjutkan</Button>
            <Button size="sm" variant="outline" onClick={discardDraft}>Hapus</Button>
          </div>
        </div>
      ) : null}

      <ol className="flex flex-wrap gap-2 text-xs font-medium">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1",
              index === step
                ? "border-primary bg-primary text-primary-foreground"
                : index < step
                  ? "border-success/40 bg-success/10 text-success"
                  : "text-muted-foreground",
            )}
          >
            <span>{index + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border bg-card p-6">
        {step === 0 && (
          <StepDataPembelajaran
            value={form.dataPembelajaran}
            onChange={(dataPembelajaran) => setForm((f) => ({ ...f, dataPembelajaran }))}
            errors={errors}
          />
        )}
        {step === 1 && (
          <StepPembelajaran
            value={form.pembelajaran}
            onChange={(pembelajaran) => setForm((f) => ({ ...f, pembelajaran }))}
            errors={errors}
          />
        )}
        {step === 2 && (
          <StepAsesmen
            value={form.asesmen}
            onChange={(asesmen) => setForm((f) => ({ ...f, asesmen }))}
            errors={errors}
          />
        )}
        {step === 3 && (
          <StepDokumen
            selectedModules={form.selectedModules}
            preset={form.preset}
            onChange={({ selectedModules, preset }) =>
              setForm((f) => ({ ...f, selectedModules, preset }))
            }
          />
        )}
        {step === 3 && errors.selectedModules ? (
          <p className="mt-3 text-xs text-destructive">{errors.selectedModules}</p>
        ) : null}
      </div>

      {submitError ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || submitting}>
          Kembali
        </Button>
        {step < STEP_LABELS.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Lanjut
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Memulai..." : "Buat Dokumen"}
          </Button>
        )}
      </div>
    </div>
  );
}

function toErrorMap(result: { success: boolean; error?: { issues: Array<{ path: (string | number)[]; message: string }> } }) {
  if (result.success || !result.error) return {};
  const map: Record<string, string> = {};
  for (const issue of result.error.issues) {
    map[String(issue.path[0])] = issue.message;
  }
  return map;
}
