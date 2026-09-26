// Plain constants with no Zod import, so browser bundles can use them without shipping Zod.
// Import via `@qb/shared/constants` in client code.
export const SUBMISSION_STATUSES = [
  "pending_review",
  "published",
  "rejected",
] as const;
export const MAX_SUBMISSION_FILE_BYTES = 20 * 1024 * 1024;

/** Why a signed-in user reports a published submission. */
export const REPORT_REASONS = [
  "wrong_details",
  "wrong_file",
  "unreadable",
  "duplicate",
  "inappropriate",
  "other",
] as const;
export const REPORT_STATUSES = ["pending", "resolved", "dismissed"] as const;
export const MAX_REPORT_DETAILS_LENGTH = 500;
/**
 * Pending reports from different users that move a published submission back to
 * pending review. Enforced by the `submission_reports_after_insert` trigger in
 * migration 0003 — change both together.
 */
export const REPORT_HIDE_THRESHOLD = 3;

export const AVATAR_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/** `admin` can moderate submissions and reports and manage the catalog and users. */
export const USER_ROLES = ["user", "admin"] as const;

/** Lifecycle of a submission's AI analysis (compress, then ask Gemini). */
export const ANALYSIS_STATUSES = [
  "queued",
  "processing",
  "completed",
  "failed",
] as const;
/** Why the AI flags a submission for a closer look. */
export const ANALYSIS_FLAGS = ["not_a_paper", "multiple_papers"] as const;
/** Admin submission list filters on the AI result. */
export const ANALYSIS_FILTERS = ["flagged", "differs"] as const;

/**
 * Standard spelling for catalog names (departments, courses, semesters, exam types):
 * trimmed, single spaces, "and" instead of "&", straight quotes, no trailing period
 * or comma. Applied to names typed by users and admins and to the AI's output.
 */
export function normalizeCatalogName(name: string): string {
  return name
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s*[&＆]\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,]+$/, "")
    .trim();
}

/** Compares catalog names: normalized and case-insensitive. */
export function catalogKey(name: string): string {
  return normalizeCatalogName(name).toLowerCase();
}
