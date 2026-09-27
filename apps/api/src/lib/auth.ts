import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import type { Database } from "../db/client";
import * as schema from "../db/schema";
import { importGoogleAvatar } from "../services/avatars";

/**
 * Google is the only way to sign in. Exported on its own so tests can build an auth
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
      },
    },
    databaseHooks: {
      user: {
        create: {
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
