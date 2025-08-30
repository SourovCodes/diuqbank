import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        },
    },
});