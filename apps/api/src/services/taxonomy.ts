import type {
  Course,
  DepartmentListItem,
  ExamType,
  Semester,
} from "@qb/shared";
import { asc, eq, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import { courses, departments, examTypes, semesters } from "../db/schema";
import { semesterRecency } from "./common";

/** Departments by name, with their number of published papers. */
export function listDepartments(db: Database): Promise<DepartmentListItem[]> {
  return db
    .select({
      id: departments.id,
      name: departments.name,
      shortName: departments.shortName,
      // Qualified by hand: drizzle leaves columns unqualified in a one-table select.
      publishedCount: sql<number>`(
        select count(*) from submissions s
        inner join questions q on q.id = s.question_id
        where q.department_id = departments.id and s.status = 'published'
      )`.mapWith(Number),
    })
    .from(departments)
    .orderBy(asc(departments.name));
}

export function listCourses(
  db: Database,
  departmentId?: number,
): Promise<Course[]> {
  return db
    .select()
    .from(courses)
    .where(departmentId ? eq(courses.departmentId, departmentId) : undefined)
    .orderBy(asc(courses.name));
}

/** Ordered by id so semesters keep their natural (insertion) order. */
export function listSemesters(db: Database): Promise<Semester[]> {
  return db
    .select()
    .from(semesters)
    .orderBy(...semesterRecency);
}

export function listExamTypes(db: Database): Promise<ExamType[]> {
  return db.select().from(examTypes).orderBy(asc(examTypes.name));
}
