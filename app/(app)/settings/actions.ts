"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      school_name: String(formData.get("school_name") ?? ""),
      default_subject: String(formData.get("default_subject") ?? ""),
      default_phase: String(formData.get("default_phase") ?? ""),
    })
    .eq("id", user.id);

  revalidatePath("/settings");
}
