import type { Course, Department, ExamType, Semester } from "@qb/shared";
import { asc, eq } from "drizzle-orm";
import type { Database } from "../db/client";
import { courses, departments, examTypes, semesters } from "../db/schema";
import { semesterRecency } from "./common";

export function listDepartments(db: Database): Promise<Department[]> {
  return db.select().from(departments).orderBy(asc(departments.name));
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
