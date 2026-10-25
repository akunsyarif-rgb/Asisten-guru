# STATUS — E-Asisten Guru (Asisten-guru)

_Disusun 25 Oktober 2026 dari isi repo (commit terakhir 20 Agustus 2026, PR #4). Hanya fakta yang tertulis di repo; yang tidak bisa diverifikasi dari repo ditandai._

## Ringkasan
Workspace digital untuk membantu guru menyusun, mengedit, menyimpan, dan mengekspor perangkat pembelajaran dengan bantuan AI, mengikuti `Blueprint_EAsisten_Guru.pdf` (PDF itu tidak ada di repo). Versi 0.1.0. Repo public. **Tidak ada commit sejak 20 Agustus (lebih dari dua bulan).**

## Stack
Next.js (App Router) + TypeScript + Tailwind, Supabase (Auth dengan Google, Postgres dengan RLS `owner_id = auth.uid()`), editor TipTap. Adapter AI dapat diganti lewat `AI_PROVIDER`: `mock`, `gemini` (gratis), `openai`, `anthropic`.

## Sudah ada
Fondasi MVP, Fase 1–5 blueprint, berjalan end-to-end menurut README:
- Fase 1: fondasi, design system internal, dashboard "Ruang Transit".
- Fase 2: wizard 4 tahap + preset, Context Engine, Prompt Engine, orkestrasi generate (paralel untuk modul independen), validasi.
- Fase 3: editor TipTap, autosave + snapshot versi, pratinjau kanvas A4.
- Fase 4: ekspor DOCX (server-side) dan Print/PDF.
- Fase 5: AI Assist berbasis teks terpilih (Perbaiki, Ringkas, Kembangkan, Formalkan, Sesuaikan, Regenerate).
- Tujuh modul dokumen: modul ajar, LKPD, asesmen, rubrik, bahan ajar, kisi-kisi, remedial/pengayaan.
- Adapter Gemini ditambahkan di commit terakhir (20 Agu).
- Commit 20 Agu juga memperbaiki error 500 di `/api/generate` yang disebut terjadi di produksi, jadi aplikasi pernah ter-deploy. Tempat deploy tidak tercatat.

## Belum / terbuka
- **Fase 6** (template authoring, dependency engine lanjutan) belum dikerjakan. Halaman Template hanya daftar read-only.
- Tidak ada tes otomatis dan tidak ada workflow CI di repo.
- Output adapter `mock` hanya menampilkan ulang data form, bukan dokumen hasil AI.
- Tidak tercatat: apakah ini masih dipakai, dan di mana ia berjalan sekarang.

## Hal yang perlu diwaspadai
- `.env.local` butuh `SUPABASE_SERVICE_ROLE_KEY` dan kunci AI. Jangan commit.
- Migrasi skema ada di `supabase/migrations/` dan dijalankan manual lewat Supabase CLI atau SQL editor.
- HTML hasil AI disanitasi di `lib/validation/content-validator.ts` sebelum disimpan atau dirender.

## Dokumen penting
`README.md` (status implementasi, struktur folder, cara ganti provider AI).

## Langkah berikutnya (usulan, bukan dari repo)
Tentukan apakah proyek ini dilanjutkan, dibekukan, atau digabung dengan Teacher Workspace, dan tulis keputusannya di sini.

---
Perbarui file ini di akhir tiap sesi kerja: tanggal, apa yang selesai, apa yang terbuka.
