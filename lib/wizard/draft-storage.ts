"use client";

import type { WizardFormState } from "@/types/context";

const STORAGE_KEY = "e-asisten-guru:wizard-draft";

export interface WizardDraft {
  form: WizardFormState;
  step: number;
  savedAt: string;
}

/**
 * Wizard autosave/recovery (blueprint section 27): if the browser closes
 * mid-wizard, the teacher can resume exactly where they left off, or
 * discard the draft. Client-only (localStorage) — nothing is persisted
 * server-side until the wizard is actually submitted.
 */
export function saveWizardDraft(draft: Omit<WizardDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  const payload: WizardDraft = { ...draft, savedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadWizardDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WizardDraft;
  } catch {
    return null;
  }
}

export function clearWizardDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
