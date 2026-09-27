import {
  REPORT_HIDE_THRESHOLD,
  type CreatedReport,
  type QuestionDetail,
  type QuestionInteractions,
  type VoteResult,
} from "@qb/shared";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  submissionReports,
  submissions,
  submissionVotes,
  user,
  type NewSubmissionRow,
} from "../src/db/schema";
import {
  api,
  db,
  jsonRequest,
  seedQuestion,
  seedSubmission,
  seedTaxonomy,
  seedUser,
  signIn,
} from "./helpers";

async function seedQuestionWithPaper(
  overrides: Partial<NewSubmissionRow> = {},
) {
  const t = await seedTaxonomy();
  const question = await seedQuestion({
    departmentId: t.cse.id,
    courseId: t.algorithms.id,
    semesterId: t.sem1.id,
    examTypeId: t.midterm.id,
  });
  const submission = await seedSubmission(question.id, overrides);
  return { question, submission };
}

const findSubmission = (id: string) =>
  db().query.submissions.findFirst({ where: eq(submissions.id, id) });

describe("view counters", () => {
  it("counts question page views from anyone, separately from paper views", async () => {
    const { question } = await seedQuestionWithPaper();
    for (let i = 0; i < 2; i++) {
      const res = await api(`/api/v1/questions/${question.id}/views`, {
        method: "POST",
      });
      expect(res.status).toBe(204);
    }

    const detail = await (
      await api(`/api/v1/questions/${question.id}`)
    ).json<QuestionDetail>();
    expect(detail.viewCount).toBe(2);
    expect(detail.submissions[0]?.viewCount).toBe(0);

    const missing = await api("/api/v1/questions/999999/views", {
      method: "POST",
    });
    expect(missing.status).toBe(404);
  });

  it("counts views of published papers only, without touching updated_at", async () => {
    const updatedAt = new Date("2024-01-01");
    const { submission } = await seedQuestionWithPaper({ updatedAt });
    const pending = await seedSubmission(submission.questionId!, {
      status: "pending_review",
    });

    const res = await api(`/api/v1/submissions/${submission.id}/views`, {
      method: "POST",
    });
    expect(res.status).toBe(204);
    expect(await findSubmission(submission.id)).toMatchObject({
      viewCount: 1,
      updatedAt,
    });

    const hidden = await api(`/api/v1/submissions/${pending.id}/views`, {
      method: "POST",
    });
    expect(hidden.status).toBe(404);
    expect((await findSubmission(pending.id))?.viewCount).toBe(0);
  });
});

describe("PUT and DELETE /api/v1/submissions/{id}/vote", () => {
  const vote = (id: string, value: number, cookie?: string) =>
    api(
      `/api/v1/submissions/${id}/vote`,
      jsonRequest("PUT", { value }, cookie),
    );

  it("requires sign-in", async () => {
    const { submission } = await seedQuestionWithPaper();
    expect((await vote(submission.id, 1)).status).toBe(401);
  });

  it("keeps like and dislike counts in sync as votes change", async () => {
    const { submission } = await seedQuestionWithPaper();
    const alice = await signIn();
    const bob = await signIn();

    const liked = await vote(submission.id, 1, alice.cookie);
    expect(liked.status).toBe(200);
    expect(await liked.json<VoteResult>()).toEqual({
      likeCount: 1,
      dislikeCount: 0,
      viewCount: 0,
      myVote: 1,
    });

    expect(
      await (await vote(submission.id, -1, bob.cookie)).json<VoteResult>(),
    ).toMatchObject({ likeCount: 1, dislikeCount: 1, myVote: -1 });

    // Changing a vote moves it between the counters; repeating it changes nothing.
    expect(
      await (await vote(submission.id, -1, alice.cookie)).json<VoteResult>(),
    ).toMatchObject({ likeCount: 0, dislikeCount: 2, myVote: -1 });
    expect(
      await (await vote(submission.id, -1, alice.cookie)).json<VoteResult>(),
    ).toMatchObject({ likeCount: 0, dislikeCount: 2 });

    const removed = await api(`/api/v1/submissions/${submission.id}/vote`, {
      method: "DELETE",
      headers: { cookie: bob.cookie },
    });
    expect(removed.status).toBe(200);
    expect(await removed.json<VoteResult>()).toMatchObject({
      likeCount: 0,
      dislikeCount: 1,
      myVote: null,
    });
    expect(await findSubmission(submission.id)).toMatchObject({
      likeCount: 0,
      dislikeCount: 1,
    });
  });

  it("rejects invalid values, votes on your own paper and unpublished papers", async () => {
    const owner = await signIn();
    const voter = await signIn();
    const { submission } = await seedQuestionWithPaper({
      uploaderId: owner.id,
    });
    const pending = await seedSubmission(submission.questionId!, {
      status: "pending_review",
    });

    expect((await vote(submission.id, 2, voter.cookie)).status).toBe(422);
    expect((await vote(submission.id, 1, owner.cookie)).status).toBe(403);
    expect((await vote(pending.id, 1, voter.cookie)).status).toBe(404);
  });

  it("removes a deleted user's votes from the counts", async () => {
    const { submission } = await seedQuestionWithPaper();
    const voter = await seedUser("Soon Gone");
    await db()
      .insert(submissionVotes)
      .values({ submissionId: submission.id, userId: voter.id, value: 1 });
    expect((await findSubmission(submission.id))?.likeCount).toBe(1);

    await db().delete(user).where(eq(user.id, voter.id));
    expect((await findSubmission(submission.id))?.likeCount).toBe(0);
  });
});

describe("submission ranking", () => {
  it("ranks papers within a status by score, then views, then newest", async () => {
    const { question, submission: lowScore } = await seedQuestionWithPaper({
      createdAt: new Date("2025-06-01"),
    });
    const topScore = await seedSubmission(question.id, {
      createdAt: new Date("2024-01-01"),
    });
    const tiedMoreViews = await seedSubmission(question.id, {
      createdAt: new Date("2024-01-01"),
      viewCount: 50,
    });
    const tiedNewer = await seedSubmission(question.id, {
      createdAt: new Date("2025-01-01"),
    });
    const pending = await seedSubmission(question.id, {
      status: "pending_review",
    });

    const [a, b] = await Promise.all([seedUser("A"), seedUser("B")]);
    await db()
      .insert(submissionVotes)
      .values([
        { submissionId: topScore.id, userId: a.id, value: 1 },
        { submissionId: topScore.id, userId: b.id, value: 1 },
        { submissionId: lowScore.id, userId: a.id, value: -1 },
        // Votes never lift an unpublished paper above published ones.
        { submissionId: pending.id, userId: a.id, value: 1 },
        { submissionId: pending.id, userId: b.id, value: 1 },
      ]);

    const detail = await (
      await api(`/api/v1/questions/${question.id}`)
    ).json<QuestionDetail>();
    expect(detail.submissions.map((s) => s.id)).toEqual([
      topScore.id,
      tiedMoreViews.id,
      tiedNewer.id,
      lowScore.id,
      pending.id,
    ]);
    expect(detail.submissions[0]).toMatchObject({
      likeCount: 2,
      dislikeCount: 0,
    });
  });
});

describe("GET /api/v1/me/questions/{id}/interactions", () => {
  it("returns the user's votes and open reports on the question's papers", async () => {
    const me = await signIn();
    const { question, submission } = await seedQuestionWithPaper();
    const other = await seedSubmission(question.id);
    await db()
      .insert(submissionVotes)
      .values({ submissionId: submission.id, userId: me.id, value: -1 });
    await db()
      .insert(submissionReports)
      .values([
        { submissionId: other.id, reporterId: me.id, reason: "duplicate" },
        {
          submissionId: submission.id,
          reporterId: me.id,
          reason: "unreadable",
          status: "dismissed",
        },
      ]);

    const path = `/api/v1/me/questions/${question.id}/interactions`;
    const res = await api(path, { headers: { cookie: me.cookie } });
    expect(res.status).toBe(200);
    expect(await res.json<QuestionInteractions>()).toEqual({
      userId: me.id,
      votes: [{ submissionId: submission.id, value: -1 }],
      reportedSubmissionIds: [other.id],
    });
    expect((await api(path)).status).toBe(401);
  });
});

describe("POST /api/v1/submissions/{id}/reports", () => {
  const report = (
    id: string,
    cookie?: string,
    body: object = { reason: "unreadable" },
  ) =>
    api(`/api/v1/submissions/${id}/reports`, jsonRequest("POST", body, cookie));

  it("requires sign-in", async () => {
    const { submission } = await seedQuestionWithPaper();
    expect((await report(submission.id)).status).toBe(401);
  });

  it("files one open report per user, never on their own paper", async () => {
    const owner = await signIn();
    const reporter = await signIn();
    const { submission } = await seedQuestionWithPaper({
      uploaderId: owner.id,
    });

    const res = await report(submission.id, reporter.cookie, {
      reason: "wrong_details",
      details: "This is the final, not the midterm",
    });
    expect(res.status).toBe(201);
    expect(await res.json<CreatedReport>()).toMatchObject({
      status: "pending",
      submissionHidden: false,
    });

    const again = await report(submission.id, reporter.cookie);
    expect(again.status).toBe(409);
    expect(await again.json()).toMatchObject({
      error: { code: "ALREADY_REPORTED" },
    });
    expect((await report(submission.id, owner.cookie)).status).toBe(403);
    // "Other" needs a description.
    expect(
      (await report(submission.id, reporter.cookie, { reason: "other" }))
        .status,
    ).toBe(422);

    expect(await findSubmission(submission.id)).toMatchObject({
      status: "published",
      pendingReportCount: 1,
    });
  });

  it(`hides a published paper once ${REPORT_HIDE_THRESHOLD} users report it`, async () => {
    const { submission } = await seedQuestionWithPaper();
    const reporters = await Promise.all(
      Array.from({ length: REPORT_HIDE_THRESHOLD }, () => signIn()),
    );

    for (const [i, reporter] of reporters.entries()) {
      const created = await (
        await report(submission.id, reporter.cookie)
      ).json<CreatedReport>();
      expect(created.submissionHidden).toBe(i === reporters.length - 1);
    }

    expect(await findSubmission(submission.id)).toMatchObject({
      status: "pending_review",
      pendingReportCount: REPORT_HIDE_THRESHOLD,
    });
    expect(
      (await api(`/api/v1/submissions/${submission.id}/file`)).status,
    ).toBe(404);

    // Hidden papers can't be reported (or voted on) any more.
    const late = await signIn();
    expect((await report(submission.id, late.cookie)).status).toBe(404);
  });

  it("keeps the open report count in sync as reports are reviewed", async () => {
    const { submission } = await seedQuestionWithPaper();
    const [a, b] = await Promise.all([seedUser("A"), seedUser("B")]);
    const [first, second] = await db()
      .insert(submissionReports)
      .values([
        { submissionId: submission.id, reporterId: a.id, reason: "duplicate" },
        { submissionId: submission.id, reporterId: b.id, reason: "wrong_file" },
      ])
      .returning();
    expect((await findSubmission(submission.id))?.pendingReportCount).toBe(2);

    await db()
      .update(submissionReports)
      .set({ status: "dismissed" })
      .where(eq(submissionReports.id, first!.id));
    expect((await findSubmission(submission.id))?.pendingReportCount).toBe(1);

    // A dismissed report doesn't block a new one from the same user.
    await db().insert(submissionReports).values({
      submissionId: submission.id,
      reporterId: a.id,
      reason: "other",
    });
    expect((await findSubmission(submission.id))?.pendingReportCount).toBe(2);

    await db()
      .delete(submissionReports)
      .where(eq(submissionReports.id, second!.id));
    expect((await findSubmission(submission.id))?.pendingReportCount).toBe(1);
  });
});
