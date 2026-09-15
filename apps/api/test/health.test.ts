import { describe, expect, it } from "vitest";
import { api } from "./helpers";

describe("system routes", () => {
  it("GET /api/v1/health", async () => {
    const res = await api("/api/v1/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("serves the OpenAPI document", async () => {
    const res = await api("/api/v1/openapi.json");
    expect(res.status).toBe(200);
    const doc = await res.json<{ paths: Record<string, unknown> }>();
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/api/v1/health",
        "/api/v1/departments",
        "/api/v1/courses",
        "/api/v1/semesters",
        "/api/v1/exam-types",
        "/api/v1/questions",
        "/api/v1/questions/{id}",
        "/api/v1/submissions/{id}/file",
        "/api/v1/contributors",
        "/api/v1/contributors/{id}",
        "/api/v1/submissions",
        "/api/v1/me/submissions",
        "/api/v1/me/submissions/{id}",
        "/api/v1/me/submissions/{id}/file",
      ]),
    );
  });

  it("returns a structured 404 for unknown routes", async () => {
    const res = await api("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "NOT_FOUND" } });
  });
});
