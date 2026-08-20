-- E-Asisten Guru — initial schema
-- Entities: profiles, documents, document_versions, generation_jobs,
-- generation_items, templates, prompt_versions.
-- Principle: Row Level Security everywhere; a user only ever reaches their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type document_status as enum ('draft', 'completed', 'archived');

create type generation_job_status as enum (
  'queued', 'running', 'completed', 'partial', 'failed', 'cancelled'
);

create type generation_item_status as enum (
  'idle', 'queued', 'generating', 'validating', 'completed', 'warning', 'error', 'cancelled'
);

create type module_id as enum (
  'modul-ajar', 'lkpd', 'asesmen', 'rubrik', 'bahan-ajar', 'kisi-kisi', 'remedial-pengayaan'
);

-- ---------------------------------------------------------------------------
-- profiles — identitas & preferensi dasar pengguna
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  school_name text,
  default_subject text,
  default_phase text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- templates — struktur dokumen yang dapat dipakai ulang
-- ---------------------------------------------------------------------------

create table templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  module_id module_id not null,
  name text not null,
  description text,
  structure jsonb not null default '{}'::jsonb,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table templates enable row level security;

create policy "templates: select own or shared" on templates
  for select using (auth.uid() = owner_id or is_shared = true);
create policy "templates: insert own" on templates
  for insert with check (auth.uid() = owner_id);
create policy "templates: update own" on templates
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "templates: delete own" on templates
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- prompt_versions — versi prompt untuk audit dan pemeliharaan (dev/admin owned)
-- ---------------------------------------------------------------------------

create table prompt_versions (
  id uuid primary key default gen_random_uuid(),
  module_id module_id not null,
  version integer not null,
  system_rules text not null,
  task_prompt text not null,
  output_schema jsonb not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (module_id, version)
);

alter table prompt_versions enable row level security;

-- Prompt versions are server-managed content, readable by any authenticated
-- user (needed so the generation service can resolve the active prompt),
-- writes are restricted to the service role (bypasses RLS) only.
create policy "prompt_versions: read authenticated" on prompt_versions
  for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- documents — dokumen aktif, status, metadata, dan konten
-- ---------------------------------------------------------------------------

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  module_id module_id not null,
  title text not null default 'Dokumen tanpa judul',
  status document_status not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  template_id uuid references templates (id) on delete set null,
  generation_job_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_owner_id_idx on documents (owner_id, updated_at desc);
create index documents_owner_status_idx on documents (owner_id, status);

alter table documents enable row level security;

create policy "documents: select own" on documents
  for select using (auth.uid() = owner_id);
create policy "documents: insert own" on documents
  for insert with check (auth.uid() = owner_id);
create policy "documents: update own" on documents
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "documents: delete own" on documents
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- document_versions — snapshot versi dokumen
-- ---------------------------------------------------------------------------

create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  version integer not null,
  content jsonb not null,
  label text,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create index document_versions_document_id_idx on document_versions (document_id, version desc);

alter table document_versions enable row level security;

create policy "document_versions: select own" on document_versions
  for select using (auth.uid() = owner_id);
create policy "document_versions: insert own" on document_versions
  for insert with check (auth.uid() = owner_id);
create policy "document_versions: delete own" on document_versions
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- generation_jobs — satu pekerjaan generate yang dapat berisi beberapa dokumen
-- ---------------------------------------------------------------------------

create table generation_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  status generation_job_status not null default 'queued',
  wizard_input jsonb not null,
  context jsonb not null,
  preset text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create index generation_jobs_owner_id_idx on generation_jobs (owner_id, created_at desc);

alter table generation_jobs enable row level security;

create policy "generation_jobs: select own" on generation_jobs
  for select using (auth.uid() = owner_id);
create policy "generation_jobs: insert own" on generation_jobs
  for insert with check (auth.uid() = owner_id);
create policy "generation_jobs: update own" on generation_jobs
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "generation_jobs: delete own" on generation_jobs
  for delete using (auth.uid() = owner_id);

alter table documents
  add constraint documents_generation_job_id_fkey
  foreign key (generation_job_id) references generation_jobs (id) on delete set null;

-- ---------------------------------------------------------------------------
-- generation_items — status dan dependency setiap dokumen dalam sebuah job
-- ---------------------------------------------------------------------------

create table generation_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references generation_jobs (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  module_id module_id not null,
  document_id uuid references documents (id) on delete set null,
  status generation_item_status not null default 'idle',
  depends_on module_id[] not null default '{}',
  attempt integer not null default 0,
  error_message text,
  warning_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_items_job_id_idx on generation_items (job_id);
create index generation_items_owner_id_idx on generation_items (owner_id);

alter table generation_items enable row level security;

create policy "generation_items: select own" on generation_items
  for select using (auth.uid() = owner_id);
create policy "generation_items: insert own" on generation_items
  for insert with check (auth.uid() = owner_id);
create policy "generation_items: update own" on generation_items
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "generation_items: delete own" on generation_items
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger templates_set_updated_at before update on templates
  for each row execute function set_updated_at();
create trigger documents_set_updated_at before update on documents
  for each row execute function set_updated_at();
create trigger generation_jobs_set_updated_at before update on generation_jobs
  for each row execute function set_updated_at();
create trigger generation_items_set_updated_at before update on generation_items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- profile auto-provisioning on signup (Google OAuth)
-- ---------------------------------------------------------------------------

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
