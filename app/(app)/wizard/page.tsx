import { WizardShell } from "@/components/wizard/wizard-shell";

export default function WizardPage() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buat Perangkat Pembelajaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi empat tahap berikut. AI akan menyusun draf dari data yang Anda berikan — Anda tetap
          menjadi otoritas akhir atas isinya.
        </p>
      </div>
      <WizardShell />
    </div>
  );
}
