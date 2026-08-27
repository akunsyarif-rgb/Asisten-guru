/**
 * Public, static setup screen shown instead of crashing when Supabase env
 * vars are still empty (see lib/supabase/middleware.ts). Never touches
 * Supabase — safe to render with no configuration at all.
 */
export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">E-Asisten Guru belum dikonfigurasi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aplikasi berjalan dalam mode konfigurasi aman karena environment Supabase belum diisi.
            Tidak ada request yang dikirim ke Supabase sampai langkah di bawah ini selesai.
          </p>
        </div>

        <ol className="space-y-4 rounded-md border bg-muted/30 p-5 text-sm">
          <li>
            <span className="font-medium">1. Salin `.env.example` ke `.env.local`</span>
            <p className="mt-1 text-muted-foreground">
              Lalu isi <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, dan{" "}
              <code className="rounded bg-muted px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> dari
              project Supabase Anda (Project Settings → API).
            </p>
          </li>
          <li>
            <span className="font-medium">2. Jalankan migration</span>
            <p className="mt-1 text-muted-foreground">
              Terapkan file di <code className="rounded bg-muted px-1 py-0.5">supabase/migrations/</code>{" "}
              ke project Supabase Anda lewat Supabase CLI atau SQL editor.
            </p>
          </li>
          <li>
            <span className="font-medium">3. Aktifkan Google sebagai provider Auth (opsional untuk mulai)</span>
            <p className="mt-1 text-muted-foreground">
              Kode login Google (`Masuk dengan Google`) sudah siap di aplikasi ini. Aktifkan
              provider Google di Supabase Auth → Providers kapan pun Anda siap; sebelum itu,
              halaman login akan menampilkan galat inisiasi OAuth jika dicoba.
            </p>
          </li>
          <li>
            <span className="font-medium">4. Restart server dev</span>
            <p className="mt-1 text-muted-foreground">
              Setelah `.env.local` terisi, jalankan ulang <code className="rounded bg-muted px-1 py-0.5">npm run dev</code>{" "}
              — halaman ini akan otomatis berpindah ke alur login/dashboard.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
