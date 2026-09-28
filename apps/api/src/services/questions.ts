import type {
  ListQuestionsQuery,
  Question,
  QuestionDetail,
  QuestionList,
} from "@qb/shared";
import { and, asc, count, desc, eq, gt, sql, type SQL } from "drizzle-orm";
import type { Database } from "../db/client";
import {
  courses,
  departments,
  examTypes,
  questions,
  semesters,
  submissions,
  user,
} from "../db/schema";
import {
  countWhereStatus,
  publicFileSize,
  questionSummaryColumns,
  semesterRecency,
  submissionStatusOrder,
} from "./common";

/** Subquery with per-status submission counts for each question that has submissions. */
function submissionCounts(db: Database) {
  return db
    .select({
      questionId: submissions.questionId,
      published: countWhereStatus("published").as("published_count"),
      pendingReview: countWhereStatus("pending_review").as(
        "pending_review_count",
      ),
      rejected: countWhereStatus("rejected").as("rejected_count"),
      latestPublishedAt:
        sql<number>`max(case when ${submissions.status} = 'published' then ${submissions.createdAt} end)`.as(
          "latest_published_at",
        ),
    })
    .from(submissions)
    .groupBy(submissions.questionId)
    .as("submission_counts");
}

/**
 * Questions joined with their lookup names and submission counts. Inner-joining the
 * counts means only questions with at least one submission (of any status) are listed.
 */
function selectQuestions(db: Database, counts = submissionCounts(db)) {
  return db
    .select({
      ...questionSummaryColumns,
      viewCount: questions.viewCount,
      submissionCounts: {
        published: counts.published,
        pendingReview: counts.pendingReview,
        rejected: counts.rejected,
      },
    })
    .from(questions)
    .innerJoin(counts, eq(counts.questionId, questions.id))
    .innerJoin(departments, eq(departments.id, questions.departmentId))
    .innerJoin(courses, eq(courses.id, questions.courseId))
    .innerJoin(semesters, eq(semesters.id, questions.semesterId))
    .innerJoin(examTypes, eq(examTypes.id, questions.examTypeId));
}

function questionFilters(query: ListQuestionsQuery) {
  const filters: SQL[] = [];
  if (query.departmentId)
    filters.push(eq(questions.departmentId, query.departmentId));
  if (query.courseId) filters.push(eq(questions.courseId, query.courseId));
  if (query.semesterId)
    filters.push(eq(questions.semesterId, query.semesterId));
  if (query.examTypeId)
    filters.push(eq(questions.examTypeId, query.examTypeId));
  return and(...filters);
}

const QUESTION_ORDER = {
  // Grouped by course and exam type with the newest semester first, since students
  // compare one exam across semesters.
  az: [
    asc(departments.shortName),
    asc(courses.name),
    asc(examTypes.name),
    ...semesterRecency,
  ],
  popular: [desc(questions.viewCount), asc(courses.name)],
} as const;

/**
 * Questions with at least one published paper; ones whose papers are all still under
 * review (or rejected) have nothing to read yet. Newest papers first by default.
 */
export async function listQuestions(
  db: Database,
  query: ListQuestionsQuery,
): Promise<QuestionList> {
  const where = questionFilters(query);
  const itemCounts = submissionCounts(db);
  const totalCounts = submissionCounts(db);
  const order =
    query.sort === "newest"
      ? [desc(itemCounts.latestPublishedAt), asc(courses.name)]
      : QUESTION_ORDER[query.sort];

  const [items, totals] = await Promise.all([
    selectQuestions(db, itemCounts)
      .where(and(where, gt(itemCounts.published, 0)))
      .orderBy(...order, asc(questions.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({ total: count() })
      .from(questions)
      .innerJoin(totalCounts, eq(totalCounts.questionId, questions.id))
      .where(and(where, gt(totalCounts.published, 0))),
  ]);

  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

/**
 * `filesUrl`: origin of the public R2 domain (FILES_URL). Empty in local dev, where
 * files are only served through the API.
 */
export async function getQuestion(
  db: Database,
  id: number,
  filesUrl: string,
): Promise<QuestionDetail | null> {
  const [question]: Question[] = await selectQuestions(db)
    .where(eq(questions.id, id))
    .limit(1);
  if (!question) return null;

  // Metadata only: the only file key that leaves the API is a published paper's
  // watermarked copy (as its URL), and uploaders expose just their public profile.
  const rows = await db
    .select({
      id: submissions.id,
      status: submissions.status,
      fileSize: publicFileSize,
      createdAt: submissions.createdAt,
      likeCount: submissions.likeCount,
      dislikeCount: submissions.dislikeCount,
      viewCount: submissions.viewCount,
      section: submissions.section,
      batch: submissions.batch,
      uploader: { id: user.id, name: user.name, image: user.image },
      watermarkedFileKey: submissions.watermarkedFileKey,
    })
    .from(submissions)
    .leftJoin(user, eq(user.id, submissions.uploaderId))
    .where(eq(submissions.questionId, id))
    // Ranking within a status: score, then views, then newest.
    .orderBy(
      submissionStatusOrder,
      desc(sql`${submissions.likeCount} - ${submissions.dislikeCount}`),
      desc(submissions.viewCount),
      desc(submissions.createdAt),
    );

  return {
    ...question,
    submissions: rows.map(({ watermarkedFileKey, ...row }) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      fileUrl: publicFileUrl(row, watermarkedFileKey, filesUrl),
    })),
  };
}

function publicFileUrl(
  row: { id: number; status: string },
  watermarkedFileKey: string | null,
  filesUrl: string,
) {
  if (row.status !== "published") return null;
  return filesUrl && watermarkedFileKey
    ? `${filesUrl.replace(/\/$/, "")}/${watermarkedFileKey}`
    : `/api/v1/submissions/${row.id}/file`;
}

/**
 * The public PDF of a published submission: its watermarked copy, or the original
 * until the copy is ready. Null if the submission isn't public.
 */
export async function getPublishedSubmissionFile(
  db: Database,
  bucket: R2Bucket,
  id: number,
): Promise<{ object: R2ObjectBody; watermarked: boolean } | null> {
  const submission = await db.query.submissions.findFirst({
    columns: { fileKey: true, watermarkedFileKey: true },
    where: and(eq(submissions.id, id), eq(submissions.status, "published")),
  });
  if (!submission) return null;
  if (submission.watermarkedFileKey) {
    const object = await bucket.get(submission.watermarkedFileKey);
    if (object) return { object, watermarked: true };
  }
  const object = await bucket.get(submission.fileKey);
  return object ? { object, watermarked: false } : null;
}
