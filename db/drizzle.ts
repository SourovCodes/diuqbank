import { config } from "dotenv";

import { drizzle } from 'drizzle-orm/postgres-js';
config({ path: ".env.local" });
export const db = drizzle(process.env.DATABASE_URL!);
