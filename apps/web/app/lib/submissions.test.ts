import type { Submission } from "@qb/shared";
import { describe, expect, it } from "vitest";
import { pickSubmission, plural } from "./submissions";

const submission = (id: string, status: Submission["status"]): Submission => ({
  id,
  status,
  fileSize: 1000,
  createdAt: "2026-01-01T00:00:00.000Z",
  likeCount: 0,
  dislikeCount: 0,
  viewCount: 0,
  uploader: null,
});

const submissions = [
  submission("a", "published"),
  submission("b", "published"),
  submission("c", "pending_review"),
  submission("d", "rejected"),
];

describe("pickSubmission", () => {
  it("defaults to the first (best ranked) published submission", () => {
    expect(pickSubmission(submissions, null)?.id).toBe("a");
  });

  it("selects the requested published submission", () => {
    expect(pickSubmission(submissions, "b")?.id).toBe("b");
  });

  it.each(["c", "d", "missing"])(
    "falls back when %s is not a published submission",
    (id) => {
      expect(pickSubmission(submissions, id)?.id).toBe("a");
    },
  );

  it("returns null when nothing is published", () => {
    expect(pickSubmission(submissions.slice(2), null)).toBeNull();
  });
});

describe("plural", () => {
  it("pluralises by count", () => {
    expect(plural(1, "paper")).toBe("1 paper");
    expect(plural(2, "paper")).toBe("2 papers");
  });
});
