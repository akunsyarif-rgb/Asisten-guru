import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getModule } from "@/modules/registry";

/**
 * Template management is a Fase 6 (Expansion) feature per the blueprint
 * roadmap. This MVP view lists what a teacher has saved so far without
 * pretending there's more here than there is (principle: No AI Slop /
 * Progressive Disclosure) — template creation ships in a later phase.
 */
export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Struktur dokumen yang dapat dipakai ulang untuk perangkat pembelajaran berikutnya.
        </p>
      </div>

      {!templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada template tersimpan.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="py-4">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getModule(template.module_id as Parameters<typeof getModule>[0]).name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
