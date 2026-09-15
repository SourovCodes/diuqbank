import type {
  ContributorDetail,
  ContributorList,
  ContributorSubmission,
  ListContributorsQuery,
} from "@qb/shared";
import { asc, count, desc, eq, isNotNull, sql } from "drizzle-orm";
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
import { countWhereStatus, submissionStatusOrder } from "./common";

/** Per-status submission counts for every user who has uploaded something. */
function uploaderCounts(db: Database) {
  return db
    .select({
      uploaderId: submissions.uploaderId,
      published: countWhereStatus("published").as("published_count"),
      pendingReview: countWhereStatus("pending_review").as(
        "pending_review_count",
      ),
      rejected: countWhereStatus("rejected").as("rejected_count"),
    })
    .from(submissions)
    .where(isNotNull(submissions.uploaderId))
    .groupBy(submissions.uploaderId)
    .as("uploader_counts");
}

/** Users joined with their counts, so only users with submissions are included. */
function selectContributors(db: Database) {
  const counts = uploaderCounts(db);
  const query = db
    .select({
      id: user.id,
      name: user.name,
      joinedAt: user.createdAt,
      submissionCounts: {
        published: counts.published,
        pendingReview: counts.pendingReview,
        rejected: counts.rejected,
      },
    })
    .from(user)
    .innerJoin(counts, eq(counts.uploaderId, user.id));
  return { counts, query };
}

export async function listContributors(
  db: Database,
  query: ListContributorsQuery,
): Promise<ContributorList> {
  const { counts, query: contributors } = selectContributors(db);
  const totalCounts = uploaderCounts(db);

  const [rows, totals] = await Promise.all([
    contributors
      .orderBy(desc(counts.published), asc(user.name))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({ total: count() })
      .from(user)
      .innerJoin(totalCounts, eq(totalCounts.uploaderId, user.id)),
  ]);

  return {
    items: rows.map((row) => ({
      ...row,
      joinedAt: row.joinedAt.toISOString(),
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

/**
 * All submissions by one uploader, in every status: published first (newest first),
 * then pending review, then rejected.
 */
export async function listUploaderSubmissions(
  db: Database,
  uploaderId: string,
): Promise<ContributorSubmission[]> {
  // A submission's classification comes from its question when linked, otherwise from
  // its proposed values: existing ids are joined, new names are read from the row.
  const rows = await db
    .select({
      submission: {
        id: submissions.id,
        status: submissions.status,
        fileSize: submissions.fileSize,
        createdAt: submissions.createdAt,
        questionId: submissions.questionId,
      },
      department: {
        id: departments.id,
        name: departments.name,
        shortName: departments.shortName,
      },
      course: { id: courses.id, name: courses.name },
      semester: { id: semesters.id, name: semesters.name },
      examType: { id: examTypes.id, name: examTypes.name },
      customDepartmentName: submissions.customDepartmentName,
      customDepartmentShortName: submissions.customDepartmentShortName,
      customCourseName: submissions.customCourseName,
      customSemesterName: submissions.customSemesterName,
    })
    .from(submissions)
    .leftJoin(questions, eq(questions.id, submissions.questionId))
    .leftJoin(
      departments,
      eq(
        departments.id,
        sql`coalesce(${questions.departmentId}, ${submissions.departmentId})`,
      ),
    )
    .leftJoin(
      courses,
      eq(
        courses.id,
        sql`coalesce(${questions.courseId}, ${submissions.courseId})`,
      ),
    )
    .leftJoin(
      semesters,
      eq(
        semesters.id,
        sql`coalesce(${questions.semesterId}, ${submissions.semesterId})`,
      ),
    )
    .leftJoin(
      examTypes,
      eq(
        examTypes.id,
        sql`coalesce(${questions.examTypeId}, ${submissions.examTypeId})`,
      ),
    )
    .where(eq(submissions.uploaderId, uploaderId))
    .orderBy(submissionStatusOrder, desc(submissions.createdAt));

  return rows.map((row) => ({
    ...row.submission,
    createdAt: row.submission.createdAt.toISOString(),
    classification: {
      department: row.department ?? {
        id: null,
        name: row.customDepartmentName ?? "",
        shortName: row.customDepartmentShortName,
      },
      course: row.course ?? { id: null, name: row.customCourseName ?? "" },
      semester: row.semester ?? {
        id: null,
        name: row.customSemesterName ?? "",
      },
      // Always present: required by the submissions CHECK constraint.
      examType: row.examType!,
    },
  }));
}

export async function getContributor(
  db: Database,
  id: string,
): Promise<ContributorDetail | null> {
  const [contributor] = await selectContributors(db)
    .query.where(eq(user.id, id))
    .limit(1);
  if (!contributor) return null;

  return {
    ...contributor,
    joinedAt: contributor.joinedAt.toISOString(),
    submissions: await listUploaderSubmissions(db, id),
  };
}
