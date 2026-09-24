import type { Question } from "@qb/shared";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, expect, it } from "vitest";
import { QuestionTable } from "./question-table";

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

async function renderRow(q: Question) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <QuestionTable questions={[q]} /> },
  ]);
  render(<Stub initialEntries={["/"]} />);
  const link = await screen.findByRole("link", { name: "Data Structures" });
  return { link, row: link.closest("tr")! };
}

it("links to the question and summarises its submissions and views", async () => {
  const { link, row } = await renderRow(question);
  expect(link.getAttribute("href")).toBe("/questions/7");
  expect(row.textContent).toContain("CSE · 2nd Semester · Midterm");
  expect(row.textContent).toContain("2 papers");
  expect(within(row).getByTitle("1 waiting for review")).toBeTruthy();
  expect(row.textContent).toContain("1.2K");
});

it("shows when only pending submissions exist", async () => {
  const { row } = await renderRow({
    ...question,
    submissionCounts: { published: 0, pendingReview: 1, rejected: 0 },
  });
  expect(row.textContent).toContain("None yet");
});
