import { env, exports } from "cloudflare:workers";
import { createDb } from "../src/db/client";
import { papers, type NewPaperRow } from "../src/db/schema";

export const ORIGIN = "http://localhost:5173";

export function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("origin")) headers.set("origin", ORIGIN);
  return exports.default.fetch(
    new Request(`${ORIGIN}${path}`, { ...init, headers }),
  );
}

/** Signs up a fresh user and returns a Cookie header value for authenticated requests. */
export async function signUp(
  email = `user-${crypto.randomUUID()}@example.com`,
) {
  const res = await api("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email,
      password: "correct-horse-battery",
    }),
  });
  if (!res.ok)
    throw new Error(`sign-up failed: ${res.status} ${await res.text()}`);
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { email, cookie };
}

export async function seedPaper(overrides: Partial<NewPaperRow> = {}) {
  const id = overrides.id ?? crypto.randomUUID();
  const [row] = await createDb(env.DB)
    .insert(papers)
    .values({
      id,
      title: "Physics Final",
      subject: "Physics",
      year: 2024,
      status: "approved",
      fileKey: `papers/${id}.pdf`,
      fileSize: 1234,
      ...overrides,
    })
    .returning();
  return row!;
}

export function pdfFile(name = "paper.pdf") {
  return new File(["%PDF-1.7\n%test\n"], name, { type: "application/pdf" });
}
