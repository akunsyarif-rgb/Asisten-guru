import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AsesmenInput } from "@/types/context";

export function StepAsesmen({
  value,
  onChange,
  errors,
}: {
  value: AsesmenInput;
  onChange: (next: AsesmenInput) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Bentuk asesmen" error={errors?.bentukAsesmen}>
        <Input
          value={value.bentukAsesmen}
          onChange={(e) => onChange({ ...value, bentukAsesmen: e.target.value })}
          placeholder="Misal: Tes tertulis, presentasi kelompok"
        />
      </Field>
      <Field label="Instrumen (opsional)">
        <Textarea
          value={value.instrumen ?? ""}
          onChange={(e) => onChange({ ...value, instrumen: e.target.value })}
        />
      </Field>
      <Field label="Rencana remedial (opsional)">
        <Textarea
          value={value.remedial ?? ""}
          onChange={(e) => onChange({ ...value, remedial: e.target.value })}
        />
      </Field>
      <Field label="Rencana pengayaan (opsional)">
        <Textarea
          value={value.pengayaan ?? ""}
          onChange={(e) => onChange({ ...value, pengayaan: e.target.value })}
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
