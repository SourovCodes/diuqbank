import { env } from "cloudflare:workers";
import type { MySubmissionList } from "@qb/shared";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { submissions } from "../src/db/schema";
import {
  api,
  db,
  seedQuestion,
  seedSubmission,
  seedTaxonomy,
  signUp,
} from "./helpers";

async function signedInUser() {
  const { cookie } = await signUp();
  const res = await api("/api/auth/get-session", { headers: { cookie } });
  const session = await res.json<{ user: { id: string } }>();
  return { cookie, id: session.user.id };
}

async function seedAnyQuestion() {
  const t = await seedTaxonomy();
  return seedQuestion({
    departmentId: t.cse.id,
    courseId: t.algorithms.id,
    semesterId: t.sem1.id,
    examTypeId: t.midterm.id,
  });
}

async function seedStoredSubmission(
  questionId: number,
  uploaderId: string,
  status: "published" | "pending_review" | "rejected",
) {
  const row = await seedSubmission(questionId, { uploaderId, status });
  await env.BUCKET.put(row.fileKey, "%PDF-1.7\n%test\n", {
    httpMetadata: { contentType: "application/pdf" },
  });
  return row;
}

const findSubmission = (id: string) =>
  db().query.submissions.findFirst({ where: eq(submissions.id, id) });

describe("GET /api/v1/me/submissions", () => {
  it("requires sign-in", async () => {
    const res = await api("/api/v1/me/submissions");
    expect(res.status).toBe(401);
  });

  it("lists only the signed-in user's submissions, in every status", async () => {
    const question = await seedAnyQuestion();
    const me = await signedInUser();
    const other = await signedInUser();
    const rejected = await seedSubmission(question.id, {
      uploaderId: me.id,
      status: "rejected",
    });
    const published = await seedSubmission(question.id, { uploaderId: me.id });
    const pending = await seedSubmission(question.id, {
      uploaderId: me.id,
      status: "pending_review",
    });
    await seedSubmission(question.id, { uploaderId: other.id });

    const res = await api("/api/v1/me/submissions", {
      headers: { cookie: me.cookie },
    });
    expect(res.status).toBe(200);
    const body = await res.json<MySubmissionList>();
    expect(body.items.map((s) => s.id)).toEqual([
      published.id,
      pending.id,
      rejected.id,
    ]);
    expect(body.items[1]).toMatchObject({
      status: "pending_review",
      questionId: question.id,
    });
  });
});

describe("GET /api/v1/me/submissions/{id}/file", () => {
  it("serves the uploader's unpublished PDF without caching, and hides it from others", async () => {
    const question = await seedAnyQuestion();
    const me = await signedInUser();
    const other = await signedInUser();
    const pending = await seedStoredSubmission(
      question.id,
      me.id,
      "pending_review",
    );
    const path = `/api/v1/me/submissions/${pending.id}/file`;

    const res = await api(path, { headers: { cookie: me.cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(new TextDecoder().decode(await res.arrayBuffer())).toMatch(/^%PDF-/);

    const forOther = await api(path, { headers: { cookie: other.cookie } });
    expect(forOther.status).toBe(404);
    expect((await api(path)).status).toBe(401);
  });
});

describe("DELETE /api/v1/me/submissions/{id}", () => {
  it.each(["pending_review", "rejected"] as const)(
    "withdraws a %s submission and deletes its PDF",
    async (status) => {
      const question = await seedAnyQuestion();
      const me = await signedInUser();
      const submission = await seedStoredSubmission(question.id, me.id, status);

      const res = await api(`/api/v1/me/submissions/${submission.id}`, {
        method: "DELETE",
        headers: { cookie: me.cookie },
      });
      expect(res.status).toBe(204);
      expect(await findSubmission(submission.id)).toBeUndefined();
      expect(await env.BUCKET.head(submission.fileKey)).toBeNull();
    },
  );

  it("refuses to withdraw a published paper", async () => {
    const question = await seedAnyQuestion();
    const me = await signedInUser();
    const published = await seedStoredSubmission(
      question.id,
      me.id,
      "published",
    );

    const res = await api(`/api/v1/me/submissions/${published.id}`, {
      method: "DELETE",
      headers: { cookie: me.cookie },
    });
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: "CONFLICT" } });
    expect(await findSubmission(published.id)).toBeDefined();
    expect(await env.BUCKET.head(published.fileKey)).not.toBeNull();
  });

  it("doesn't touch another user's submission", async () => {
    const question = await seedAnyQuestion();
    const owner = await signedInUser();
    const other = await signedInUser();
    const pending = await seedStoredSubmission(
      question.id,
      owner.id,
      "pending_review",
    );

    const res = await api(`/api/v1/me/submissions/${pending.id}`, {
      method: "DELETE",
      headers: { cookie: other.cookie },
    });
    expect(res.status).toBe(404);
    expect(await findSubmission(pending.id)).toBeDefined();
  });
});
