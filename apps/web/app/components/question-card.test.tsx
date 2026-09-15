import type { Question } from "@qb/shared";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, it } from "vitest";
import { QuestionCard } from "./question-card";

const question: Question = {
  id: 7,
  department: {
    id: 1,
    name: "Computer Science and Engineering",
    shortName: "CSE",
  },
  course: { id: 3, name: "Data Structures" },
  semester: { id: 2, name: "2nd Semester" },
  examType: { id: 1, name: "Midterm" },
  publishedSubmissionCount: 2,
};

it("links to the question and summarises it", async () => {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <QuestionCard question={question} /> },
  ]);
  render(<Stub initialEntries={["/"]} />);

  const link = await screen.findByRole("link", { name: /Data Structures/ });
  expect(link.getAttribute("href")).toBe("/questions/7");
  expect(link.textContent).toContain("CSE · 2nd Semester · Midterm");
  expect(link.textContent).toContain("2 files");
});
