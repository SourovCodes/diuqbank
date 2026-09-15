import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const departments = sqliteTable("departments", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  shortName: text().notNull().unique(),
});

export const courses = sqliteTable(
  "courses",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    departmentId: integer()
      .notNull()
      .references(() => departments.id),
  },
  (t) => [
    // Also serves as the index for looking up courses by department.
    unique("courses_department_id_name_unique").on(t.departmentId, t.name),
    // Referenced by the composite foreign key on `questions`, which guarantees a
    // question's department is the same as its course's department.
    unique("courses_id_department_id_unique").on(t.id, t.departmentId),
  ],
);

export const semesters = sqliteTable("semesters", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});

export const examTypes = sqliteTable("exam_types", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});

export type DepartmentRow = typeof departments.$inferSelect;
export type CourseRow = typeof courses.$inferSelect;
export type SemesterRow = typeof semesters.$inferSelect;
export type ExamTypeRow = typeof examTypes.$inferSelect;
