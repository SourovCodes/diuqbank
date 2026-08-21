import { and, count, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";

import type { Db } from "../db/client";
import {
  courses,
  departments,
  examTypes,
  questions,
  semesters,
  submissions,
} from "../db/schema";
import { buildMeta } from "../shared/utils/pagination";
import { buildQuestionTitle } from "../shared/utils/question-title";
import type { Page, Question, Submission } from "../shared/types";
import { fileUrlFor, toContributorSummary } from "./user-shape";

/**
 * The question query layer, shared by the HTTP routes (which wrap these in
 * `withCache`) and the MCP server (src/mcp.ts, which calls them directly).
 * Keeping the Drizzle queries and DTO mapping here means `buildQuestionTitle`
 * and `fileUrlFor` stay the single source of truth for both surfaces.
 */

/** Column selections for the nested lookup entities embedded in a question. */
export const entityColumns = {
  department: { columns: { id: true, name: true, shortName: true } },
  course: { columns: { id: true, departmentId: true, name: true } },
  semester: { columns: { id: true, name: true } },
  examType: { columns: { id: true, name: true } },
} as const;

// A search of more than a handful of words is either a paste or an attempt to
// make us build a pathological query; the extra tokens can only narrow the
// result set anyway, so dropping them costs nothing.
const SEARCH_TOKEN_LIMIT = 6;

/**
 * Free-text filter over the parts a question title is built from (see
 * `buildQuestionTitle`): course name, department name/short name, semester and
 * exam type. Every whitespace-separated token must match at least one of those
 * columns, so "data structures final cse" narrows across all four lookups —
 * a single substring match on one column would find nothing.
 *
 * Returned as an `IN (subquery)` predicate so callers keep using the relational
 * `findMany` shape instead of hand-rolling the four joins. Like the admin list
 * routes this relies on SQLite `LIKE` being case-insensitive for ASCII.
 */
export const questionSearchFilter = (
  db: Db,
  search: string,
): SQL | undefined => {
  const tokens = search.split(/\s+/).filter(Boolean).slice(0, SEARCH_TOKEN_LIMIT);
  if (tokens.length === 0) return undefined;

  const matching = db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(departments, eq(departments.id, questions.departmentId))
    .innerJoin(courses, eq(courses.id, questions.courseId))
    .innerJoin(semesters, eq(semesters.id, questions.semesterId))
    .innerJoin(examTypes, eq(examTypes.id, questions.examTypeId))
    .where(
      and(
        ...tokens.map((token) => {
          const pattern = `%${token}%`;
          return or(
            like(courses.name, pattern),
            like(departments.name, pattern),
            like(departments.shortName, pattern),
            like(semesters.name, pattern),
            like(examTypes.name, pattern),
          );
        }),
      ),
    );

  return inArray(questions.id, matching);
};

export type QuestionListParams = {
  page: number;
  perPage: number;
  search?: string;
  departmentId?: number;
  courseId?: number;
  semesterId?: number;
  examTypeId?: number;
};

/** The `WHERE` shared by the public and admin question list endpoints. */
export const questionListWhere = (
  db: Db,
  params: Omit<QuestionListParams, "page" | "perPage">,
): SQL | undefined => {
  const filters: SQL[] = [];
  if (params.departmentId)
    filters.push(eq(questions.departmentId, params.departmentId));
  if (params.courseId) filters.push(eq(questions.courseId, params.courseId));
  if (params.semesterId)
    filters.push(eq(questions.semesterId, params.semesterId));
  if (params.examTypeId)
    filters.push(eq(questions.examTypeId, params.examTypeId));

  if (params.search) {
    const searchFilter = questionSearchFilter(db, params.search);
    if (searchFilter) filters.push(searchFilter);
  }

  return filters.length ? and(...filters) : undefined;
};

/** Paginated questions with their lookup entities, newest first. */
export const listQuestions = async (
  db: Db,
  params: QuestionListParams,
): Promise<Page<Question>> => {
  const { page, perPage } = params;
  const where = questionListWhere(db, params);

  const items = await db.query.questions.findMany({
    where,
    columns: { id: true, submissionCount: true, viewCount: true },
    with: entityColumns,
    orderBy: desc(questions.id),
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(questions)
    .where(where);

  return {
    data: items.map((q) => ({
      id: q.id,
      title: buildQuestionTitle(q),
      submissionCount: q.submissionCount,
      viewCount: q.viewCount,
      department: q.department,
      course: q.course,
      semester: q.semester,
      examType: q.examType,
    })),
    meta: buildMeta(page, perPage, total),
  };
};

/** A single question with its lookup entities, or null if it doesn't exist. */
export const getQuestion = async (
  db: Db,
  id: number,
): Promise<Question | null> => {
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, id),
    columns: { id: true, submissionCount: true, viewCount: true },
    with: entityColumns,
  });

  if (!question) return null;

  return {
    id: question.id,
    title: buildQuestionTitle(question),
    submissionCount: question.submissionCount,
    viewCount: question.viewCount,
    department: question.department,
    course: question.course,
    semester: question.semester,
    examType: question.examType,
  };
};

/**
 * Every submission for a question (no pagination — a single question has few),
 * or null if the question doesn't exist, so callers can 404 rather than return
 * a misleading empty list.
 */
export const listQuestionSubmissions = async (
  db: Db,
  id: number,
): Promise<Submission[] | null> => {
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, id),
    columns: { id: true },
  });
  if (!question) return null;

  const rows = await db.query.submissions.findMany({
    where: eq(submissions.questionId, id),
    columns: {
      id: true,
      section: true,
      batch: true,
      fileSize: true,
      viewCount: true,
      createdAt: true,
      pdfKey: true,
      watermarkedPdfKey: true,
    },
    with: {
      user: { columns: { id: true, name: true, username: true, imageKey: true } },
    },
    orderBy: [desc(submissions.viewCount), desc(submissions.createdAt)],
  });

  return rows.map((s) => ({
    id: s.id,
    section: s.section,
    batch: s.batch,
    fileSize: s.fileSize,
    viewCount: s.viewCount,
    createdAt: s.createdAt,
    // Prefer the watermarked file once it exists; fall back to the original.
    pdfUrl: fileUrlFor(s.watermarkedPdfKey ?? s.pdfKey),
    contributor: s.user ? toContributorSummary(s.user) : null,
  }));
};
