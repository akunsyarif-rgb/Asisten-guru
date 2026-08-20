import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferensi dasar akun Anda.</p>
      </div>

      <form action={updateProfile} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nama lengkap</Label>
          <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="school_name">Nama sekolah</Label>
          <Input id="school_name" name="school_name" defaultValue={profile?.school_name ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default_subject">Mata pelajaran default</Label>
          <Input id="default_subject" name="default_subject" defaultValue={profile?.default_subject ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default_phase">Fase/kelas default</Label>
          <Input id="default_phase" name="default_phase" defaultValue={profile?.default_phase ?? ""} />
        </div>
        <div>
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </div>
  );
}
