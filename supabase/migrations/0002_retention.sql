-- Data retention is configuration-driven (see config/retention.ts), not
-- hard-coded in the schema. This migration only provides the mechanism:
-- a function the app (or a scheduled Supabase Edge Function / pg_cron job)
-- calls with explicit, adjustable thresholds. Nothing here runs on a fixed
-- six-month cycle and nothing deletes a teacher's active documents —
-- only expired generation jobs/items, which are transient working data.

create or replace function purge_expired_generation_data(
  job_retention_days integer default 90
) returns integer as $$
declare
  deleted_count integer;
begin
  delete from generation_jobs
  where status in ('completed', 'failed', 'cancelled', 'partial')
    and created_at < now() - make_interval(days => job_retention_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer set search_path = public;

comment on function purge_expired_generation_data is
  'Deletes only transient generation_jobs/generation_items past the given '
  'retention window. Documents are never touched here — archiving or '
  'deleting a document is always an explicit, transparent user action '
  '(see lib/documents/service.ts).';
