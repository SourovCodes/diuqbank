import type {
  Contributor as ContributorDTO,
  ContributorSummary as ContributorSummaryDTO,
  User as UserDTO,
} from "../shared/types";
import type { User } from "../db/schema";

type UserRow = Pick<
  User,
  "id" | "name" | "email" | "username" | "role" | "imageKey" | "createdAt"
>;

// Public custom domain of the production R2 bucket (diuqbank-files-prod).
// Objects are served directly by Cloudflare — the API doesn't proxy files in
// production. `setR2PublicBase` lets local dev point this at the Worker's own
// `/files/*` route instead (see index.ts + routes/files.ts), since files
// uploaded to `wrangler dev`'s simulated local R2 don't exist at the real
// r2.diuqbank.com URL.
let r2PublicBase = "https://r2.diuqbank.com";

export const setR2PublicBase = (base: string) => {
  r2PublicBase = base;
};

export const getR2PublicBase = () => r2PublicBase;

/** Build the public R2 URL for a stored object key. */
export const fileUrlFor = (key: string | null): string | null =>
  key ? `${r2PublicBase}/${key}` : null;

/** Build the public R2 URL for a stored image key. */
export const imageUrlFor = (imageKey: string | null): string | null =>
  fileUrlFor(imageKey);

/**
 * The public-safe user shape returned by auth endpoints. Centralised so every
 * endpoint that exposes a user stays in sync.
 */
export const toAuthUser = (row: UserRow): UserDTO => ({
  id: row.id,
  name: row.name,
  email: row.email,
  username: row.username,
  role: row.role,
  image: imageUrlFor(row.imageKey),
  createdAt: row.createdAt,
});

export type AuthUser = ReturnType<typeof toAuthUser>;

type ContributorRow = Pick<
  User,
  "id" | "name" | "username" | "imageKey" | "createdAt"
> & { submissionCount: number };

/**
 * Public-safe contributor shape (no email, no role). Used by the public
 * `/contributors` list and detail endpoints. `submissionCount` comes from the
 * `users.submission_count` column, which SQLite triggers keep in sync on every
 * submission insert/delete/move.
 */
export const toContributor = (row: ContributorRow): ContributorDTO => ({
  id: row.id,
  name: row.name,
  username: row.username,
  image: imageUrlFor(row.imageKey),
  submissionCount: row.submissionCount,
  createdAt: row.createdAt,
});

export type Contributor = ReturnType<typeof toContributor>;

/** Minimal contributor reference embedded in a submission. */
export const toContributorSummary = (
  row: Pick<User, "id" | "name" | "username" | "imageKey">,
): ContributorSummaryDTO => ({
  id: row.id,
  name: row.name,
  username: row.username,
  image: imageUrlFor(row.imageKey),
});

export type ContributorSummary = ReturnType<typeof toContributorSummary>;
