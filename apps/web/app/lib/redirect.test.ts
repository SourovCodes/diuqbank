import { describe, expect, it } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  it.each(["/", "/contribute", "/papers/1?x=1"])(
    "allows relative path %s",
    (to) => {
      expect(safeRedirect(to)).toBe(to);
    },
  );

  it.each([
    null,
    undefined,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "contribute",
  ])("falls back for %s", (to) => {
    expect(safeRedirect(to)).toBe("/");
  });
});
