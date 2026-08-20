import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Pembelajaran } from "@/types/context";

export function StepPembelajaran({
  value,
  onChange,
  errors,
}: {
  value: Pembelajaran;
  onChange: (next: Pembelajaran) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Tujuan pembelajaran" error={errors?.tujuanPembelajaran}>
        <Textarea
          value={value.tujuanPembelajaran}
          onChange={(e) => onChange({ ...value, tujuanPembelajaran: e.target.value })}
          placeholder="Peserta didik mampu ..."
        />
      </Field>
      <Field label="Target hasil belajar (opsional)">
        <Textarea
          value={value.targetHasilBelajar ?? ""}
          onChange={(e) => onChange({ ...value, targetHasilBelajar: e.target.value })}
        />
      </Field>
      <Field label="Metode / model pembelajaran" error={errors?.metodeModel}>
        <Input
          value={value.metodeModel}
          onChange={(e) => onChange({ ...value, metodeModel: e.target.value })}
          placeholder="Misal: Problem Based Learning"
        />
      </Field>
      <Field label="Aktivitas (opsional)">
        <Textarea
          value={value.aktivitas ?? ""}
          onChange={(e) => onChange({ ...value, aktivitas: e.target.value })}
          placeholder="Aktivitas yang benar-benar akan dilakukan di kelas"
        />
      </Field>
      <Field label="Sarana (opsional)">
        <Input
          value={value.sarana ?? ""}
          onChange={(e) => onChange({ ...value, sarana: e.target.value })}
          placeholder="Misal: Proyektor, LKPD cetak"
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
