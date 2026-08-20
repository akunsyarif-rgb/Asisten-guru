# E-Asisten Guru

Workspace digital untuk membantu guru menyusun, mengedit, menyimpan, dan mengekspor perangkat
pembelajaran dengan bantuan AI — dibangun mengikuti `Blueprint_EAsisten_Guru.pdf`.

Alur utama: **INPUT GURU → CONTEXT ENGINE → AI GENERATION → VALIDATION → DOCUMENT WORKSPACE →
EDIT & REVIEW → AUTOSAVE → EXPORT.**

Prinsip produk: AI mempercepat pekerjaan guru, guru tetap menjadi otoritas akhir atas isi
dokumen. Lihat `31 — PRINSIP ARSITEKTUR YANG DIKUNCI` di blueprint untuk prinsip non-negotiable.

## Status implementasi

Fondasi MVP (Fase 1–5 blueprint) sudah berjalan end-to-end:

- **Fase 1 — Foundation**: Next.js (App Router) + TypeScript + Tailwind + design system internal,
  Supabase Auth/DB dengan RLS, dashboard "Ruang Transit".
- **Fase 2 — Core Workflow**: Wizard 4 tahap + preset + smart dependency UI, Context Engine,
  Prompt Engine, AI Provider/Adapter abstraction, Generation Orchestrator (paralel untuk modul
  independen, berurutan untuk modul dependent), Validation Layer.
- **Fase 3 — Document Workspace**: Editor TipTap, autosave (debounced) + version snapshot,
  preview kanvas A4.
- **Fase 4 — Export**: DOCX (server-side), Print/PDF manual (kanvas A4 via `window.print()`).
- **Fase 5 — AI Assist**: aksi selection-based (Perbaiki, Ringkas, Kembangkan, Formalkan,
  Sesuaikan, Regenerate) yang hanya memproses teks terpilih.

Fase 6 (Expansion — template authoring, dependency engine lanjutan) belum diimplementasikan;
halaman Template saat ini hanya menampilkan daftar (read-only) sesuai prinsip Progressive
Disclosure — tidak berpura-pura ada fitur yang belum benar-benar ada.

## Menjalankan secara lokal

1. `npm install`
2. Salin `.env.example` ke `.env.local` dan isi:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` dari
     project Supabase Anda.
   - `AI_PROVIDER=mock` untuk mencoba seluruh alur (wizard → generate → editor → export) tanpa
     API key AI apa pun — adapter mock bersifat deterministik dan tidak pernah mengarang data
     (lihat `lib/ai/adapters/mock.ts`), tapi outputnya hanya menampilkan ulang data form, bukan
     dokumen tersusun AI. Untuk generation sungguhan, set `AI_PROVIDER=gemini` +
     `GEMINI_API_KEY` (gratis, tanpa kartu kredit, ambil di
     [aistudio.google.com/apikey](https://aistudio.google.com/apikey)), atau `openai`/`anthropic`
     beserta API key-nya (berbayar).
3. Jalankan migration di `supabase/migrations/` pada project Supabase Anda (lewat Supabase CLI atau
   SQL editor), lalu aktifkan **Google** sebagai provider di Supabase Auth.
4. `npm run dev` lalu buka `http://localhost:3000`.

Perintah lain: `npm run build`, `npm run lint`, `npm run typecheck`.

## Arsitektur & struktur folder

Mengikuti `28 — FOLDER STRUCTURE` pada blueprint:

- `app/` — halaman & route (App Router). `app/(auth)` untuk login, `app/(app)` untuk halaman yang
  memerlukan sesi (dibungkus `AppShell`), `app/api` untuk route handlers.
- `components/` — komponen UI & workflow (`ui/` = design system primitives, `wizard/`,
  `workspace/`, `generation/`, `dashboard/`, `layout/`).
- `lib/` — business logic: `supabase/`, `ai/` (Provider → Adapter → Prompt Engine → Generation
  Service), `prompts/`, `context/`, `validation/`, `documents/`, `generation/` (orchestrator),
  `export/`.
- `modules/` — 7 modul dokumen (`modul-ajar`, `lkpd`, `asesmen`, `rubrik`, `bahan-ajar`,
  `kisi-kisi`, `remedial-pengayaan`), masing-masing modular & independen sesuai section 12.
- `types/`, `schemas/`, `config/` — kontrak data (TypeScript types, Zod schemas) dan konfigurasi
  (AI provider, retention, presets).
- `supabase/migrations/` — skema database + Row Level Security.

Business logic sengaja tidak diletakkan di komponen React — komponen hanya memanggil `lib/*` dan
`app/api/*`.

### Mengganti model/provider AI

`AI_PROVIDER` di `.env.local` memilih adapter di `lib/ai/provider.ts`. Menambah provider baru =
menambah satu file di `lib/ai/adapters/` yang mengimplementasikan `ModelAdapter` — tidak ada
business logic lain (prompt engine, validator, orchestrator) yang perlu diubah, sesuai section 06.

### Keamanan

Semua tabel memakai Row Level Security (`owner_id = auth.uid()`), API key AI hanya dibaca di
server (`lib/ai/adapters/*`, tidak pernah diekspos ke client), payload divalidasi dengan Zod di
setiap route, dan HTML hasil AI disanitasi (`lib/validation/content-validator.ts`) sebelum
disimpan atau dirender.
