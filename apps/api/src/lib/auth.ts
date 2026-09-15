import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { Database } from "../db/client";
import * as schema from "../db/schema";

// Workers have no long-lived process, and bindings are only available per request,
// so the auth instance is built from the request's env instead of a module singleton.
export function createAuth(env: Env, db: Database) {
  return betterAuth({
    appName: "QuestionBank",
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: env.TRUSTED_ORIGINS.split(",").map((origin) =>
      origin.trim(),
    ),
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth["$Infer"]["Session"];
