import { describe, expect, it } from "vitest";
import { createPaperInputSchema, listPapersQuerySchema } from "./paper";

describe("createPaperInputSchema", () => {
  it("trims strings and coerces year from form data", () => {
    const result = createPaperInputSchema.parse({
      title: "  Physics Final  ",
      subject: " Physics ",
      year: "2024",
    });
    expect(result).toEqual({
      title: "Physics Final",
      subject: "Physics",
      year: 2024,
    });
  });

  it("rejects years far in the future", () => {
    const year = new Date().getUTCFullYear() + 5;
    expect(
      createPaperInputSchema.safeParse({
        title: "Maths",
        subject: "Maths",
        year,
      }).success,
    ).toBe(false);
  });
});

describe("listPapersQuerySchema", () => {
  it("applies pagination defaults", () => {
    expect(listPapersQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("caps page size", () => {
    expect(listPapersQuerySchema.safeParse({ pageSize: "500" }).success).toBe(
      false,
    );
  });
});
