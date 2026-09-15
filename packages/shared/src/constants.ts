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
