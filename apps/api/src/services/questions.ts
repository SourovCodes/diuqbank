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
} from "../db/schema";

/** Subquery of published submission counts per question. */
function publishedCounts(db: Database) {
  return db
    .select({
      questionId: submissions.questionId,
      count: count().as("published_count"),
    })
    .from(submissions)
    .where(eq(submissions.status, "published"))
    .groupBy(submissions.questionId)
    .as("published");
}

/**
 * Questions joined with their lookup names. Inner-joining the published counts means
 * questions without any published submission are never exposed.
 */
function selectQuestions(db: Database) {
  const published = publishedCounts(db);
  return db
    .select({
      id: questions.id,
      department: {
        id: departments.id,
        name: departments.name,
        shortName: departments.shortName,
      },
      course: { id: courses.id, name: courses.name },
      semester: { id: semesters.id, name: semesters.name },
      examType: { id: examTypes.id, name: examTypes.name },
      publishedSubmissionCount: published.count,
    })
    .from(questions)
    .innerJoin(published, eq(published.questionId, questions.id))
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
  const published = publishedCounts(db);

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
      .innerJoin(published, eq(published.questionId, questions.id))
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

  const rows = await db
    .select({
      id: submissions.id,
      fileSize: submissions.fileSize,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(
      and(eq(submissions.questionId, id), eq(submissions.status, "published")),
    )
    .orderBy(desc(submissions.createdAt));

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
