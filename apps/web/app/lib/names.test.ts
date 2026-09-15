import { describe, expect, it } from "vitest";
import { initials } from "./names";

describe("initials", () => {
  it.each([
    ["Ayesha Rahman", "AR"],
    ["  nusrat   jahan khan ", "NJ"],
    ["Tanvir", "T"],
    ["", "?"],
  ])("%j → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
