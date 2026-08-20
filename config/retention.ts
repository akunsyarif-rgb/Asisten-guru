/**
 * Data retention configuration (blueprint section 05).
 *
 * Rules encoded here, deliberately NOT hard-coded elsewhere:
 *  - Teacher documents are never bulk-deleted on a fixed schedule.
 *  - Only transient generation data has a retention window, and it is a
 *    config value so it can change without a code deploy.
 *  - Any deletion/archival must be visible to the user (see
 *    lib/documents/service.ts — archive/delete are explicit user actions).
 */
export const retentionConfig = {
  /** Temporary generation working data (drafts, in-flight context). */
  generationTempRetentionDays: envInt("GENERATION_TEMP_RETENTION_DAYS", 60, {
    min: 30,
    max: 90,
  }),
  /** generation_jobs / generation_items history, kept for audit. */
  generationLogRetentionDays: envInt("GENERATION_LOG_RETENTION_DAYS", 120, {
    min: 90,
    max: 180,
  }),
} as const;

function envInt(
  key: string,
  fallback: number,
  bounds: { min: number; max: number },
): number {
  const raw = process.env[key];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}
