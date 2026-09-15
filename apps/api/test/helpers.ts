import { env, exports } from "cloudflare:workers";
import { createDb } from "../src/db/client";
import {
  courses,
  departments,
  examTypes,
  questions,
  semesters,
  submissions,
  type NewQuestionRow,
  type NewSubmissionRow,
  user,
} from "../src/db/schema";

export const ORIGIN = "http://localhost:5173";

/** Inserts a user directly (no password), for tests that only need an uploader. */
export async function seedUser(name = "Test Contributor") {
  const id = crypto.randomUUID();
  const [row] = await createDb(env.DB)
    .insert(user)
    .values({ id, name, email: `${id}@example.com` })
    .returning();
  return row!;
}

export function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("origin")) headers.set("origin", ORIGIN);
  return exports.default.fetch(
    new Request(`${ORIGIN}${path}`, { ...init, headers }),
  );
}

export const db = () => createDb(env.DB);

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

/**
 * Inserts two departments with one course each, two semesters and two exam types.
 * Names get a random suffix so tests stay independent even when storage is shared.
 */
export async function seedTaxonomy() {
  const tag = crypto.randomUUID().slice(0, 8);
  const [cse, eee] = await db()
    .insert(departments)
    .values([
      { name: `Computer Science ${tag}`, shortName: `CSE-${tag}` },
      { name: `Electrical Engineering ${tag}`, shortName: `EEE-${tag}` },
    ])
    .returning();
  const [algorithms, circuits] = await db()
    .insert(courses)
    .values([
      { name: `Algorithms ${tag}`, departmentId: cse!.id },
      { name: `Circuits ${tag}`, departmentId: eee!.id },
    ])
    .returning();
  const [sem1, sem2] = await db()
    .insert(semesters)
    .values([{ name: `1st Semester ${tag}` }, { name: `2nd Semester ${tag}` }])
    .returning();
  const [midterm, final] = await db()
    .insert(examTypes)
    .values([{ name: `Midterm ${tag}` }, { name: `Final ${tag}` }])
    .returning();

  return {
    cse: cse!,
    eee: eee!,
    algorithms: algorithms!,
    circuits: circuits!,
    sem1: sem1!,
    sem2: sem2!,
    midterm: midterm!,
    final: final!,
  };
}

export async function seedQuestion(values: NewQuestionRow) {
  const [row] = await db().insert(questions).values(values).returning();
  return row!;
}

export async function seedSubmission(
  questionId: number,
  overrides: Partial<NewSubmissionRow> = {},
) {
  const id = overrides.id ?? crypto.randomUUID();
  const [row] = await db()
    .insert(submissions)
    .values({
      id,
      questionId,
      status: "published",
      fileKey: `submissions/${id}.pdf`,
      fileSize: 1234,
      ...overrides,
    })
    .returning();
  return row!;
}

export function pdfFile(name = "paper.pdf") {
  return new File(["%PDF-1.7\n%test\n"], name, { type: "application/pdf" });
}
