import { describe, expect, it } from "vitest";
import { fieldErrorsFrom } from "./api-errors";

describe("fieldErrorsFrom", () => {
  it("maps validation issues to the first message per field", () => {
    const errors = fieldErrorsFrom({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: [
          { path: ["title"], message: "Too short" },
          { path: ["title"], message: "Ignored" },
          { path: ["year"], message: "Too small" },
        ],
      },
    });
    expect(errors).toEqual({ title: "Too short", year: "Too small" });
  });

  it("returns nothing for other errors", () => {
    expect(
      fieldErrorsFrom({
        error: { code: "INVALID_FILE", message: "File must be a PDF" },
      }),
    ).toEqual({});
    expect(fieldErrorsFrom(null)).toEqual({});
  });
});
