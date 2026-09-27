import type {
  CourseList,
  DepartmentList,
  ExamTypeList,
  SemesterList,
} from "@qb/shared";
import { describe, expect, it } from "vitest";
import { api, seedQuestion, seedSubmission, seedTaxonomy } from "./helpers";

describe("taxonomy routes", () => {
  it("lists departments with their short names and published papers", async () => {
    const { cse, algorithms, sem1, midterm } = await seedTaxonomy();
    const question = await seedQuestion({
      departmentId: cse.id,
      courseId: algorithms.id,
      semesterId: sem1.id,
      examTypeId: midterm.id,
    });
    await seedSubmission(question.id);
    await seedSubmission(question.id, { status: "pending_review" });

    const body = await (
      await api("/api/v1/departments")
    ).json<DepartmentList>();
    expect(body.items).toContainEqual({
      id: cse.id,
      name: cse.name,
      shortName: cse.shortName,
      publishedCount: 1,
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
