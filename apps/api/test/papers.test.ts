import { env } from "cloudflare:workers";
import type { Paper, PaperList } from "@qb/shared";
import { describe, expect, it } from "vitest";
import { api, pdfFile, seedPaper, signUp } from "./helpers";

function uploadForm(overrides: Record<string, string | File> = {}) {
  const form = new FormData();
  const fields = {
    title: "Chemistry Midterm",
    subject: "Chemistry",
    year: "2023",
    file: pdfFile(),
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return form;
}

describe("GET /api/v1/papers", () => {
  it("lists only approved papers, newest first", async () => {
    await seedPaper({ title: "Old", createdAt: new Date("2024-01-01") });
    await seedPaper({ title: "New", createdAt: new Date("2025-01-01") });
    await seedPaper({ title: "Hidden", status: "pending" });

    const res = await api("/api/v1/papers");
    expect(res.status).toBe(200);
    const body = await res.json<PaperList>();
    expect(body.total).toBe(2);
    expect(body.items.map((p) => p.title)).toEqual(["New", "Old"]);
  });

  it("filters by subject and year", async () => {
    await seedPaper({ subject: "Maths", year: 2022 });
    await seedPaper({ subject: "Maths", year: 2023 });
    await seedPaper({ subject: "Biology", year: 2023 });

    const body = await (
      await api("/api/v1/papers?subject=Maths&year=2023")
    ).json<PaperList>();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ subject: "Maths", year: 2023 });
  });

  it("rejects invalid query params", async () => {
    const res = await api("/api/v1/papers?pageSize=1000");
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });
});

describe("GET /api/v1/papers/:id", () => {
  it("returns an approved paper", async () => {
    const row = await seedPaper();
    const res = await api(`/api/v1/papers/${row.id}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: row.id, title: row.title });
  });

  it("hides pending papers", async () => {
    const row = await seedPaper({ status: "pending" });
    expect((await api(`/api/v1/papers/${row.id}`)).status).toBe(404);
  });
});

describe("GET /api/v1/papers/:id/file", () => {
  it("streams the PDF from R2", async () => {
    const row = await seedPaper();
    await env.BUCKET.put(row.fileKey, "%PDF-1.7 hello", {
      httpMetadata: { contentType: "application/pdf" },
    });

    const res = await api(`/api/v1/papers/${row.id}/file`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(new TextDecoder().decode(await res.arrayBuffer())).toBe(
      "%PDF-1.7 hello",
    );
  });
});

describe("POST /api/v1/papers", () => {
  it("requires authentication", async () => {
    const res = await api("/api/v1/papers", {
      method: "POST",
      body: uploadForm(),
    });
    expect(res.status).toBe(401);
  });

  it("stores the PDF in R2 and creates a pending paper", async () => {
    const { cookie } = await signUp();
    const res = await api("/api/v1/papers", {
      method: "POST",
      headers: { cookie },
      body: uploadForm(),
    });

    expect(res.status).toBe(201);
    const paper = await res.json<Paper>();
    expect(paper).toMatchObject({
      title: "Chemistry Midterm",
      subject: "Chemistry",
      year: 2023,
      status: "pending",
    });

    const object = await env.BUCKET.get(`papers/${paper.id}.pdf`);
    expect(await object?.text()).toMatch(/^%PDF-/);

    // Not publicly visible until approved.
    expect((await api(`/api/v1/papers/${paper.id}`)).status).toBe(404);
  });

  it("rejects files that are not PDFs", async () => {
    const { cookie } = await signUp();
    const fake = new File(["hello"], "paper.pdf", { type: "application/pdf" });
    const res = await api("/api/v1/papers", {
      method: "POST",
      headers: { cookie },
      body: uploadForm({ file: fake }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: { code: "INVALID_FILE" } });
  });

  it("validates metadata", async () => {
    const { cookie } = await signUp();
    const res = await api("/api/v1/papers", {
      method: "POST",
      headers: { cookie },
      body: uploadForm({ title: "x", year: "1800" }),
    });
    expect(res.status).toBe(422);
  });
});
