import type {
  CourseList,
  DepartmentList,
  ExamTypeList,
  SemesterList,
} from "@qb/shared";
import { apiGetJson } from "./api.server";

/** Departments, courses, semesters and exam types, for filters and forms. */
export async function loadTaxonomy(request: Request) {
  const [departments, courses, semesters, examTypes] = await Promise.all([
    apiGetJson<DepartmentList>(request, "/api/v1/departments"),
    apiGetJson<CourseList>(request, "/api/v1/courses"),
    apiGetJson<SemesterList>(request, "/api/v1/semesters"),
    apiGetJson<ExamTypeList>(request, "/api/v1/exam-types"),
  ]);
  return {
    departments: departments.items,
    courses: courses.items,
    semesters: semesters.items,
    examTypes: examTypes.items,
  };
}
