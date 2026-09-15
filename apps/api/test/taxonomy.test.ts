import type {
  CourseList,
  DepartmentList,
  ExamTypeList,
  SemesterList,
} from "@qb/shared";
import { describe, expect, it } from "vitest";
import { api, seedTaxonomy } from "./helpers";

describe("taxonomy routes", () => {
  it("lists departments with their short names", async () => {
    const { cse } = await seedTaxonomy();
    const body = await (
      await api("/api/v1/departments")
    ).json<DepartmentList>();
    expect(body.items).toContainEqual({
      id: cse.id,
      name: cse.name,
      shortName: cse.shortName,
    });
  });

  it("lists all courses, or only one department's courses", async () => {
    const { cse, algorithms, circuits } = await seedTaxonomy();

    const all = await (await api("/api/v1/courses")).json<CourseList>();
    expect(all.items.map((c) => c.id)).toEqual(
      expect.arrayContaining([algorithms.id, circuits.id]),
    );

    const filtered = await (
      await api(`/api/v1/courses?departmentId=${cse.id}`)
    ).json<CourseList>();
    expect(filtered.items).toEqual([
      { id: algorithms.id, name: algorithms.name, departmentId: cse.id },
    ]);
  });

  it("rejects an invalid department filter", async () => {
    expect((await api("/api/v1/courses?departmentId=abc")).status).toBe(422);
  });

  it("lists semesters and exam types", async () => {
    const { sem1, sem2, midterm } = await seedTaxonomy();

    const semesters = await (
      await api("/api/v1/semesters")
    ).json<SemesterList>();
    const ids = semesters.items.map((s) => s.id);
    expect(ids.indexOf(sem1.id)).toBeLessThan(ids.indexOf(sem2.id));

    const examTypes = await (
      await api("/api/v1/exam-types")
    ).json<ExamTypeList>();
    expect(examTypes.items).toContainEqual(midterm);
  });
});
