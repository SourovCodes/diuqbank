import { describe, expect, it } from "vitest";
import {
  catalogKey,
  normalizeCatalogName,
  parseSemesterName,
} from "./constants";

describe("normalizeCatalogName", () => {
  it.each([
    ["Computer Science & Engineering", "Computer Science and Engineering"],
    ["Computer Science&Engineering", "Computer Science and Engineering"],
    ["  Data   Structures  ", "Data Structures"],
    ["Business Administration.", "Business Administration"],
    ["Men’s Health", "Men's Health"],
    ["C++ Programming", "C++ Programming"],
  ])("%s → %s", (input, output) => {
    expect(normalizeCatalogName(input)).toBe(output);
  });
});

describe("catalogKey", () => {
  it("ignores case and the & spelling", () => {
    expect(catalogKey("Electrical & Electronic engineering")).toBe(
      catalogKey("electrical and electronic Engineering"),
    );
  });
});

describe("parseSemesterName", () => {
  it.each([
    ["Fall 25", "Fall 25"],
    ["fall 2025", "Fall 25"],
    ["SPRING-26", "Spring 26"],
    ["Summer'20", "Summer 20"],
    [" short  15 ", "Short 15"],
    ["Fall 30", "Fall 30"],
  ])("%s → %s", (input, output) => {
    expect(parseSemesterName(input)).toBe(output);
  });

  it.each([
    "Fall 14",
    "Spring 31",
    "Winter 25",
    "1st Semester",
    "Fall",
    "25",
    "Fall 2125",
  ])("rejects %s", (input) => {
    expect(parseSemesterName(input)).toBeNull();
  });
});
