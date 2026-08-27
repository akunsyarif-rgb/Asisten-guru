/**
 * Whether Supabase env vars are filled in. Used to keep the app booting in a
 * safe "not configured yet" state instead of crashing on every request when
 * `.env.local` still has the empty placeholders from `.env.example`.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
