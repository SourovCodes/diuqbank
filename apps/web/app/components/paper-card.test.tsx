import type { Paper } from "@qb/shared";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, it } from "vitest";
import { PaperCard } from "./paper-card";

const paper: Paper = {
  id: "paper-1",
  title: "Physics Final",
  subject: "Physics",
  year: 2024,
  status: "approved",
  fileSize: 2048,
  createdAt: "2025-01-01T00:00:00.000Z",
};

it("links to the paper and shows its metadata", async () => {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <PaperCard paper={paper} /> },
  ]);
  render(<Stub initialEntries={["/"]} />);

  const link = await screen.findByRole("link", { name: /Physics Final/ });
  expect(link.getAttribute("href")).toBe("/papers/paper-1");
  expect(link.textContent).toContain("Physics · 2024 · 2.0 KB");
});
