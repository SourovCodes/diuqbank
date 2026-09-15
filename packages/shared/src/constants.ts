// Plain constants with no Zod import, so browser bundles can use them without shipping Zod.
// Import via `@qb/shared/constants` in client code.
export const SUBMISSION_STATUSES = [
  "pending_review",
  "published",
  "rejected",
] as const;
export const MAX_SUBMISSION_FILE_BYTES = 20 * 1024 * 1024;
