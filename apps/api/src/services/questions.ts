import type {
  ListQuestionsQuery,
  Question,
  QuestionDetail,
  QuestionList,
} from "@qb/shared";
import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";
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
  questionSummaryColumns,
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
    })
    .from(submissions)
    .groupBy(submissions.questionId)
    .as("submission_counts");
}

/**
 * Questions joined with their lookup names and submission counts. Inner-joining the
 * counts means only questions with at least one submission (of any status) are listed.
 */
function selectQuestions(db: Database) {
  const counts = submissionCounts(db);
  return db
    .select({
      ...questionSummaryColumns,
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

export async function listQuestions(
  db: Database,
  query: ListQuestionsQuery,
): Promise<QuestionList> {
  const where = questionFilters(query);
  const counts = submissionCounts(db);

  const [items, totals] = await Promise.all([
    selectQuestions(db)
      .where(where)
      .orderBy(
        asc(departments.shortName),
        asc(courses.name),
        asc(semesters.id),
        asc(examTypes.name),
      )
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({ total: count() })
      .from(questions)
      .innerJoin(counts, eq(counts.questionId, questions.id))
      .where(where),
  ]);

  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

export async function getQuestion(
  db: Database,
  id: number,
): Promise<QuestionDetail | null> {
  const [question]: Question[] = await selectQuestions(db)
    .where(eq(questions.id, id))
    .limit(1);
  if (!question) return null;

  // Metadata only: file keys never leave the API, files are served separately
  // (published submissions only), and uploaders expose just their public name.
  const rows = await db
    .select({
      id: submissions.id,
      status: submissions.status,
      fileSize: submissions.fileSize,
      createdAt: submissions.createdAt,
      uploader: { id: user.id, name: user.name },
    })
    .from(submissions)
    .leftJoin(user, eq(user.id, submissions.uploaderId))
    .where(eq(submissions.questionId, id))
    .orderBy(submissionStatusOrder, desc(submissions.createdAt));

  return {
    ...question,
    submissions: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

/** Returns the R2 object for a published submission, or null if it isn't public. */
export async function getPublishedSubmissionFile(
  db: Database,
  bucket: R2Bucket,
  id: string,
) {
  const submission = await db.query.submissions.findFirst({
    columns: { fileKey: true },
    where: and(eq(submissions.id, id), eq(submissions.status, "published")),
  });
  if (!submission) return null;
  return bucket.get(submission.fileKey);
}
