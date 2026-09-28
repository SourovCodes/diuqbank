import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { EMAIL_DOMAIN_NOT_ALLOWED, isAllowedEmail } from "@qb/shared/constants";
import { APIError, betterAuth, type BetterAuthOptions } from "better-auth";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client";
import * as schema from "../db/schema";
import { user } from "../db/schema";
import { importGoogleAvatar } from "../services/avatars";

/** A sign-up refused by the DIU email rule; the login page explains it. */
const notAllowed = () =>
  new APIError("FORBIDDEN", {
    code: EMAIL_DOMAIN_NOT_ALLOWED,
    message: "Only DIU email addresses can create an account",
  });

/** A new user's username until they pick one, like the old site's: `user_1a2b3c`. */
function generateUsername(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return `user_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** A generated username nobody has yet. */
async function freshUsername(db: Database): Promise<string> {
  for (;;) {
    const username = generateUsername();
    const [taken] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, username));
    if (!taken) return username;
  }
}

/**
 * Google is the only way to sign in. New accounts need a DIU address
 * (ALLOWED_EMAIL_DOMAINS); existing accounts can always sign in. Exported on its own so tests can build an auth
 * instance with the same options plus Better Auth's `testUtils` plugin.
 */
export function authOptions(env: Env, db: Database) {
  return {
    appName: "QuestionBank",
    baseURL: new URL(env.SITE_URL).origin,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [new URL(env.SITE_URL).origin],
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    user: {
      additionalFields: {
        // Returned with the session. `input: false` keeps it out of sign-up and
        // update-user, so only an admin (or `pnpm make-admin`) can change it.
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
        // Changed through /api/v1/me/username, which validates it.
        username: { type: "string", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // The DIU rule only applies to new accounts: anyone who already has one
          // can sign in whatever their email. Refused before the account exists, so
          // no stray users are left behind.
          before: async (created) => {
            if (!isAllowedEmail(created.email)) throw notAllowed();
            return {
              data: { ...created, username: await freshUsername(db) },
            };
          },
          // Google gives a new user its photo URL; keep a copy of our own instead.
          after: async (created) => {
            if (created.image) {
              await importGoogleAvatar(
                db,
                env.BUCKET,
                created.id,
                created.image,
              );
            }
          },
        },
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: "select_account",
      },
    },
  } satisfies BetterAuthOptions;
}

// Workers have no long-lived process, and bindings are only available per request,
// so the auth instance is built from the request's env instead of a module singleton.
export function createAuth(env: Env, db: Database) {
  return betterAuth(authOptions(env, db));
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth["$Infer"]["Session"];
