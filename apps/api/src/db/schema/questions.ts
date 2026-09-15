import { SUBMISSION_STATUSES } from "@qb/shared";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { timestamps } from "./columns";
import { courses, departments, examTypes, semesters } from "./taxonomy";

/** A question is one department + course + semester + exam type combination. */
export const questions = sqliteTable(
  "questions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    departmentId: integer()
      .notNull()
      .references(() => departments.id),
    courseId: integer().notNull(),
    semesterId: integer()
      .notNull()
      .references(() => semesters.id),
    examTypeId: integer()
      .notNull()
      .references(() => examTypes.id),
    ...timestamps,
  },
  (t) => [
    // (course_id, department_id) must exist in courses, so the department always
    // matches the course's department.
    foreignKey({
      name: "questions_course_department_fk",
      columns: [t.courseId, t.departmentId],
      foreignColumns: [courses.id, courses.departmentId],
    }),
    // department_id is implied by the course, so the course identifies the combination.
    unique("questions_course_semester_exam_type_unique").on(
      t.courseId,
      t.semesterId,
      t.examTypeId,
    ),
    index("questions_department_id_idx").on(t.departmentId),
    index("questions_semester_id_idx").on(t.semesterId),
    index("questions_exam_type_id_idx").on(t.examTypeId),
  ],
);

/** An uploaded PDF for a question. Only `published` submissions are public. */
export const submissions = sqliteTable(
  "submissions",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    questionId: integer()
      .notNull()
      .references(() => questions.id),
    status: text({ enum: SUBMISSION_STATUSES })
      .notNull()
      .default("pending_review"),
    /** R2 object key of the PDF. */
    fileKey: text().notNull().unique(),
    fileSize: integer().notNull(),
    uploaderId: text().references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    index("submissions_question_id_status_idx").on(t.questionId, t.status),
    index("submissions_uploader_id_idx").on(t.uploaderId),
  ],
);

export type QuestionRow = typeof questions.$inferSelect;
export type NewQuestionRow = typeof questions.$inferInsert;
export type SubmissionRow = typeof submissions.$inferSelect;
export type NewSubmissionRow = typeof submissions.$inferInsert;
