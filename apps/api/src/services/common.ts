import type { SubmissionStatus } from "@qb/shared";
import { sql } from "drizzle-orm";
import {
  courses,
  departments,
  examTypes,
  questions,
  semesters,
  submissions,
} from "../db/schema";

/** Aggregate: number of submissions with the given status in the current group. */
export const countWhereStatus = (status: SubmissionStatus) =>
  sql<number>`sum(case when ${submissions.status} = ${status} then 1 else 0 end)`;

/** Sort order for submission lists: published, then pending review, then rejected. */
export const submissionStatusOrder = sql`case ${submissions.status} when 'published' then 0 when 'pending_review' then 1 else 2 end`;

/**
 * Columns for a question summary. Requires questions to be joined with departments,
 * courses, semesters and exam types.
 */
export const questionSummaryColumns = {
  id: questions.id,
  department: {
    id: departments.id,
    name: departments.name,
    shortName: departments.shortName,
  },
  course: { id: courses.id, name: courses.name },
  semester: { id: semesters.id, name: semesters.name },
  examType: { id: examTypes.id, name: examTypes.name },
};
