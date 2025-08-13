import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load env for Drizzle CLI only. Quiet reduces noisy tips during builds.
config({ path: ".env.local", quiet: true as unknown as boolean });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
