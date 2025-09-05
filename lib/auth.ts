import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";

// Function to generate username from email
function generateUsernameFromEmail(email: string): string {
    // Extract the part before @ and remove any special characters
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    return baseUsername.toLowerCase();
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
        usePlural: true,
    }),
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true,
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
            mapProfileToUser: (profile) => {
                const generatedUsername = generateUsernameFromEmail(profile.email);
                return {
                    username: generatedUsername,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    emailVerified: true,
                };
            }
        },
    },
});