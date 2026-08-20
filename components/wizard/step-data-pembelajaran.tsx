import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { DataPembelajaran } from "@/types/context";

export function StepDataPembelajaran({
  value,
  onChange,
  errors,
}: {
  value: DataPembelajaran;
  onChange: (next: DataPembelajaran) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Mata pelajaran" error={errors?.mapel}>
        <Input
          value={value.mapel}
          onChange={(e) => onChange({ ...value, mapel: e.target.value })}
          placeholder="Misal: Matematika"
        />
      </Field>
      <Field label="Fase / Kelas" error={errors?.faseKelas}>
        <Input
          value={value.faseKelas}
          onChange={(e) => onChange({ ...value, faseKelas: e.target.value })}
          placeholder="Misal: Fase D / Kelas VII"
        />
      </Field>
      <Field label="Materi" error={errors?.materi}>
        <Textarea
          value={value.materi}
          onChange={(e) => onChange({ ...value, materi: e.target.value })}
          placeholder="Misal: Persamaan linear satu variabel"
        />
      </Field>
      <Field label="Alokasi waktu" error={errors?.alokasiWaktu}>
        <Input
          value={value.alokasiWaktu}
          onChange={(e) => onChange({ ...value, alokasiWaktu: e.target.value })}
          placeholder="Misal: 2 x 40 menit"
        />
      </Field>
      <Field label="Kompetensi awal (opsional)">
        <Textarea
          value={value.kompetensiAwal ?? ""}
          onChange={(e) => onChange({ ...value, kompetensiAwal: e.target.value })}
          placeholder="Kemampuan prasyarat peserta didik"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
