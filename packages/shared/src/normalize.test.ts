import { describe, expect, it } from "vitest";
import { catalogKey, normalizeCatalogName } from "./constants";

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
