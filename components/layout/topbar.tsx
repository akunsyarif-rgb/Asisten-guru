import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
        E-Asisten Guru
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        ) : null}
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </header>
  );
}
