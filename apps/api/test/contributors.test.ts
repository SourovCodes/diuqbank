import type { ContributorDetail, ContributorList } from "@qb/shared";
import { describe, expect, it } from "vitest";
import { submissions } from "../src/db/schema";
import {
  api,
  db,
  seedQuestion,
  seedSubmission,
  seedTaxonomy,
  seedUser,
} from "./helpers";

async function seedQuestions() {
  const t = await seedTaxonomy();
  const base = { departmentId: t.cse.id, courseId: t.algorithms.id };
  const midterm = await seedQuestion({
    ...base,
    semesterId: t.sem1.id,
    examTypeId: t.midterm.id,
  });
  const final = await seedQuestion({
    ...base,
    semesterId: t.sem1.id,
    examTypeId: t.final.id,
  });
  return { t, midterm, final };
}

describe("GET /api/v1/contributors", () => {
  it("lists only users with published papers, most published first", async () => {
    const { midterm, final } = await seedQuestions();
    const newcomer = await seedUser("Newcomer");
    const top = await seedUser("Top Contributor");
    const lurker = await seedUser("Lurker");

    await seedSubmission(midterm.id, { uploaderId: top.id });
    await seedSubmission(final.id, { uploaderId: top.id });
    await seedSubmission(final.id, { uploaderId: top.id, status: "rejected" });
    await seedSubmission(midterm.id, {
      uploaderId: newcomer.id,
      status: "pending_review",
    });

    const res = await api("/api/v1/contributors?pageSize=100");
    expect(res.status).toBe(200);
    const body = await res.json<ContributorList>();
    const ours = body.items.filter((c) =>
      [top.id, newcomer.id, lurker.id].includes(c.id),
    );
    // The newcomer's only upload is still pending, which isn't public.
    expect(ours).toEqual([
      {
        id: top.id,
        name: "Top Contributor",
        image: null,
        joinedAt: top.createdAt.toISOString(),
        publishedCount: 2,
      },
    ]);
    expect(JSON.stringify(body)).not.toContain("@example.com");
  });

  it("rejects invalid pagination", async () => {
    expect((await api("/api/v1/contributors?page=0")).status).toBe(422);
  });
});

describe("GET /api/v1/contributors/:id", () => {
  it("returns only the contributor's published papers, with their questions", async () => {
    const { t, midterm, final } = await seedQuestions();
    const contributor = await seedUser("Busy Contributor");
    await seedSubmission(final.id, {
      uploaderId: contributor.id,
      status: "pending_review",
    });
    const published = await seedSubmission(midterm.id, {
      uploaderId: contributor.id,
    });
    await seedSubmission(midterm.id); // someone else's

    const res = await api(`/api/v1/contributors/${contributor.id}`);
    expect(res.status).toBe(200);
    const body = await res.json<ContributorDetail>();
    expect(body).toMatchObject({
      id: contributor.id,
      name: "Busy Contributor",
      publishedCount: 1,
    });
    expect(body.submissions).toEqual([
      {
        id: published.id,
        status: "published",
        fileSize: published.fileSize,
        createdAt: published.createdAt.toISOString(),
        questionId: midterm.id,
        likeCount: 0,
        dislikeCount: 0,
        viewCount: 0,
        section: null,
        batch: null,
        classification: {
          department: t.cse,
          course: { id: t.algorithms.id, name: t.algorithms.name },
          semester: t.sem1,
          examType: t.midterm,
        },
      },
    ]);
    expect(JSON.stringify(body)).not.toContain("@example.com");
  });

  it("404s for users whose papers are all still under review or rejected", async () => {
    const { t, final } = await seedQuestions();
    const contributor = await seedUser("Proposer");
    await seedSubmission(final.id, {
      uploaderId: contributor.id,
      status: "rejected",
    });
    await db()
      .insert(submissions)
      .values({
        fileKey: `submissions/${crypto.randomUUID()}.pdf`,
        fileSize: 10,
        uploaderId: contributor.id,
        departmentId: t.cse.id,
        customCourseName: "Compilers",
        customSemesterName: "Short 19",
        examTypeId: t.final.id,
      });

    expect((await api(`/api/v1/contributors/${contributor.id}`)).status).toBe(
      404,
    );
  });

  it("404s for unknown users and users without submissions", async () => {
    const lurker = await seedUser("Lurker");
    expect((await api(`/api/v1/contributors/${lurker.id}`)).status).toBe(404);
    expect((await api("/api/v1/contributors/nope")).status).toBe(404);
  });
});
