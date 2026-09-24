// Seeds the LOCAL D1 database and R2 bucket with sample data (never touches remote).
// Run from the repo root with `pnpm db:seed` after `pnpm db:migrate`.
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "better-auth/crypto";

const apiDir = path.join(import.meta.dirname, "..");
const sqlFile = path.join(import.meta.dirname, "dev.sql");
const samplePdf = path.join(import.meta.dirname, "sample.pdf");
const bucket = "questionbank-papers";

function wrangler(args) {
  execFileSync("pnpm", ["exec", "wrangler", ...args], {
    cwd: apiDir,
    stdio: ["ignore", "ignore", "inherit"],
  });
}

wrangler(["d1", "execute", "DB", "--local", "--file", sqlFile]);

const keys = new Set(
  [
    ...readFileSync(sqlFile, "utf8").matchAll(/'(submissions\/[^']+\.pdf)'/g),
  ].map((match) => match[1]),
);
for (const key of keys) {
  wrangler([
    "r2",
    "object",
    "put",
    `${bucket}/${key}`,
    "--file",
    samplePdf,
    "--content-type",
    "application/pdf",
    "--local",
  ]);
}

const size = statSync(samplePdf).size;
wrangler([
  "d1",
  "execute",
  "DB",
  "--local",
  "--command",
  `UPDATE submissions SET file_size = ${size} WHERE id LIKE 'seed-%'`,
]);

// An admin who can log in, for the admin panel. Hashed here because Better Auth
// stores a salted scrypt hash that plain SQL can't produce.
const ADMIN_EMAIL = "admin@seed.local";
const ADMIN_PASSWORD = "correct-horse-battery";
const hash = await hashPassword(ADMIN_PASSWORD);
wrangler([
  "d1",
  "execute",
  "DB",
  "--local",
  "--command",
  `INSERT INTO "user" (id, name, email, email_verified, role) VALUES ('seed-user-admin', 'Admin', '${ADMIN_EMAIL}', 1, 'admin');
   INSERT INTO account (id, account_id, provider_id, user_id, password) VALUES ('seed-account-admin', 'seed-user-admin', 'credential', 'seed-user-admin', '${hash}');`,
]);

console.log(`Seeded local D1 and uploaded ${keys.size} sample PDFs to R2.`);
console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
