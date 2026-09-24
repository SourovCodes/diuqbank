import type {
  AdminSubmission,
  ContributorSubmission,
  SubmissionClassification,
} from "@qb/shared";
import { eq, sql } from "drizzle-orm";
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

/**
 * Submissions with what they are filed under and who uploaded them. Chain `where`,
 * `orderBy`, `limit` and `offset` onto the result.
 *
 * A submission's classification comes from its question when linked, otherwise from
 * its proposed values: existing ids are joined, new names are read from the row.
 */
export function selectSubmissionRows(db: Database) {
  return db
    .select({
      submission: {
        id: submissions.id,
        status: submissions.status,
        fileSize: submissions.fileSize,
        createdAt: submissions.createdAt,
        updatedAt: submissions.updatedAt,
        questionId: submissions.questionId,
        likeCount: submissions.likeCount,
        dislikeCount: submissions.dislikeCount,
        viewCount: submissions.viewCount,
        pendingReportCount: submissions.pendingReportCount,
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
      uploader: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
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
    .leftJoin(user, eq(user.id, submissions.uploaderId))
    .$dynamic();
}

export type SubmissionRowData = Awaited<
  ReturnType<typeof selectSubmissionRows>
>[number];

export function toClassification(
  row: SubmissionRowData,
): SubmissionClassification {
  return {
    department: row.department ?? {
      id: null,
      name: row.customDepartmentName ?? "",
      shortName: row.customDepartmentShortName,
    },
    course: row.course ?? { id: null, name: row.customCourseName ?? "" },
    semester: row.semester ?? { id: null, name: row.customSemesterName ?? "" },
    // Always present: required by the submissions CHECK constraint.
    examType: row.examType!,
  };
}

/** The public view of a row: no uploader details, report counts or edit times. */
export function toContributorSubmission(
  row: SubmissionRowData,
): ContributorSubmission {
  const {
    pendingReportCount: _,
    updatedAt: __,
    ...submission
  } = row.submission;
  return {
    ...submission,
    createdAt: submission.createdAt.toISOString(),
    classification: toClassification(row),
  };
}

export function toAdminSubmission(row: SubmissionRowData): AdminSubmission {
  return {
    ...row.submission,
    createdAt: row.submission.createdAt.toISOString(),
    updatedAt: row.submission.updatedAt.toISOString(),
    classification: toClassification(row),
    uploader: row.uploader,
  };
}
