import type { Submission } from "@qb/shared";
import { describe, expect, it } from "vitest";
import {
  paperDetails,
  paperTitles,
  pickSubmission,
  plural,
} from "./submissions";

const submission = (id: string, status: Submission["status"]): Submission => ({
  id,
  status,
  fileSize: 1000,
  createdAt: "2026-01-01T00:00:00.000Z",
  likeCount: 0,
  dislikeCount: 0,
  viewCount: 0,
  section: null,
  batch: null,
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

describe("paperDetails", () => {
  it.each([
    [{ section: "5A", batch: "61" }, "Section 5A · Batch 61"],
    [{ section: null, batch: "61" }, "Batch 61"],
    [{ section: null, batch: null }, null],
  ])("%j → %s", (value, expected) => {
    expect(paperDetails(value)).toBe(expected);
  });
});

describe("paperTitles", () => {
  const paper = (
    id: string,
    batch: string | null,
    uploader: string | null,
  ) => ({
    id,
    section: null,
    batch,
    uploader: uploader ? { id: uploader, name: uploader, image: null } : null,
  });

  it("keeps distinct titles as they are", () => {
    const titles = paperTitles([
      paper("a", "61", "Jane"),
      paper("b", "62", "Sam"),
    ]);
    expect([...titles.values()]).toEqual(["Batch 61", "Batch 62"]);
  });

  it("adds the uploader to clashing details, then numbers what still clashes", () => {
    const titles = paperTitles([
      paper("a", "65", "Jane"),
      paper("b", "65", "Sam"),
      paper("c", null, null),
      paper("d", "65", "Sam"),
    ]);
    expect([...titles.values()]).toEqual([
      "Batch 65 · Jane",
      "Batch 65 · Sam (1)",
      "Paper 3",
      "Batch 65 · Sam (2)",
    ]);
  });
});
