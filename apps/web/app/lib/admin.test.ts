import type { SubmissionClassification } from "@qb/shared";
import { describe, expect, it } from "vitest";
import { classificationLine, proposesNewEntries } from "./admin";

const existing: SubmissionClassification = {
  department: { id: 1, name: "Computer Science", shortName: "CSE" },
  course: { id: 2, name: "Algorithms" },
  semester: { id: 3, name: "3rd Semester" },
  examType: { id: 4, name: "Final" },
};

describe("proposesNewEntries", () => {
  it("is true while any value is a new name", () => {
    expect(proposesNewEntries(existing)).toBe(false);
    expect(
      proposesNewEntries({
        ...existing,
        semester: { id: null, name: "Summer Term" },
      }),
    ).toBe(true);
  });
});

describe("classificationLine", () => {
  it("prefers the department's short name", () => {
    expect(classificationLine(existing)).toBe("CSE · 3rd Semester · Final");
    expect(
      classificationLine({
        ...existing,
        department: { id: null, name: "Marine Science", shortName: null },
      }),
    ).toBe("Marine Science · 3rd Semester · Final");
  });
});
