import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function loginAction() {
    "use server";
    await signInWithGoogle(params.next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold tracking-tight">E-Asisten Guru</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Workspace digital untuk menyusun perangkat pembelajaran dengan bantuan AI. AI
          mempercepat pekerjaan Anda; keputusan akhir tetap di tangan guru.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Gagal masuk. Silakan coba lagi.
          </p>
        ) : null}

        <form action={loginAction} className="mt-8">
          <Button type="submit" className="w-full" size="lg">
            Masuk dengan Google
          </Button>
        </form>
      </div>
    </div>
  );
}
