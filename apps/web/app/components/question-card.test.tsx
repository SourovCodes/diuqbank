import type { Question } from "@qb/shared";
import { cleanup, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, expect, it } from "vitest";
import { QuestionCard } from "./question-card";

afterEach(cleanup);

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
  submissionCounts: { published: 2, pendingReview: 1, rejected: 0 },
  viewCount: 1234,
};

function renderCard(q: Question) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <QuestionCard question={q} /> },
  ]);
  render(<Stub initialEntries={["/"]} />);
  return screen.findByRole("link", { name: /Data Structures/ });
}

it("links to the question and summarises its submissions and views", async () => {
  const link = await renderCard(question);
  expect(link.getAttribute("href")).toBe("/questions/7");
  expect(link.textContent).toContain("CSE · 2nd Semester · Midterm");
  expect(link.textContent).toContain("2 papers");
  expect(link.textContent).toContain("1 pending review");
  expect(link.textContent).toContain("1.2K views");
});

it("shows when only pending submissions exist", async () => {
  const link = await renderCard({
    ...question,
    submissionCounts: { published: 0, pendingReview: 1, rejected: 0 },
  });
  expect(link.textContent).toContain("No papers yet");
});
