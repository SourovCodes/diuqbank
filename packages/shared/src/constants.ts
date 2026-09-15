// Plain constants with no Zod import, so browser bundles can use them without shipping Zod.
// Import via `@qb/shared/constants` in client code.
export const PAPER_STATUSES = ["pending", "approved", "rejected"] as const;
export const MAX_PAPER_FILE_BYTES = 20 * 1024 * 1024;
export const MIN_PAPER_YEAR = 1950;
