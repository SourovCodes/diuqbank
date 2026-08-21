import { McpServer } from "@modelcontextprotocol/server";
import { asc } from "drizzle-orm";
import { z } from "zod";

import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "@diuqbank/shared";
import { getDb } from "./db/client";
import { courses, departments, examTypes, semesters } from "./db/schema";
import {
  getQuestion,
  listQuestionSubmissions,
  listQuestions,
} from "./lib/questions-query";
import { sortSemesters } from "./lib/semester-sort";
import type { Bindings } from "./types";

/**
 * The MCP server, served at `POST /mcp` (see src/index.ts).
 *
 * Stateless: the 2026-07-28 spec dropped the initialize handshake and session
 * ids, so a fresh `McpServer` is built per request and no Durable Object is
 * involved. Every tool is anonymous — it reads the same free, public data the
 * website serves, so requiring auth would only make the server harder to use.
 *
 * Queries go through src/lib/questions-query.ts, the same layer the HTTP routes
 * use, so titles and file URLs can never drift between the two surfaces.
 */

const SERVER_NAME = "diuqbank";
const SERVER_VERSION = "1.0.0";

// Fallback for the canonical site origin used to build human-facing question
// links. Normally taken from the first WEB_ORIGINS entry (see `siteOrigin`).
const DEFAULT_SITE_ORIGIN = "https://diuqbank.com";

const siteOrigin = (env: Bindings): string =>
  env.WEB_ORIGINS?.split(",")[0]?.trim() || DEFAULT_SITE_ORIGIN;

const questionUrl = (env: Bindings, id: number) =>
  `${siteOrigin(env)}/questions/${id}`;

// --- Output schemas -------------------------------------------------------
// Mirror the DTOs in src/shared/types.ts. Declared so tools can return
// `structuredContent` that clients can consume without parsing prose.

const departmentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  shortName: z.string(),
});

const courseSchema = z.object({
  id: z.number().int(),
  departmentId: z.number().int(),
  name: z.string(),
});

const lookupSchema = z.object({ id: z.number().int(), name: z.string() });

const questionSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  url: z.string(),
  submissionCount: z.number().int(),
  viewCount: z.number().int(),
  department: departmentSchema,
  course: courseSchema,
  semester: lookupSchema,
  examType: lookupSchema,
});

const submissionSchema = z.object({
  id: z.number().int(),
  section: z.string().nullable(),
  batch: z.string().nullable(),
  fileSize: z.number().int(),
  viewCount: z.number().int(),
  createdAt: z.number().int(),
  pdfUrl: z.string().nullable(),
  contributor: z
    .object({
      id: z.number().int(),
      name: z.string(),
      username: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),
});

// --- Text renderings ------------------------------------------------------
// Clients that ignore `structuredContent` still need a usable answer, and a
// compact line beats a wall of pretty-printed JSON in an LLM's context.

const renderQuestionLine = (q: z.infer<typeof questionSchema>) =>
  `#${q.id} — ${q.title} · ${q.submissionCount} paper${q.submissionCount === 1 ? "" : "s"} · ${q.url}`;

const renderSubmissionLine = (s: z.infer<typeof submissionSchema>) => {
  const parts = [`#${s.id}`];
  if (s.section) parts.push(`section ${s.section}`);
  if (s.batch) parts.push(`batch ${s.batch}`);
  if (s.contributor) parts.push(`by ${s.contributor.name}`);
  parts.push(s.pdfUrl ?? "no PDF available");
  return parts.join(" · ");
};

export const createServer = (env: Bindings) => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.registerTool(
    "search_questions",
    {
      title: "Search question papers",
      description:
        "Search DIU (Daffodil International University) past exam question papers. " +
        "Prefer the `search` argument with plain language — every whitespace-separated word must match the course, department, semester, or exam type, so `data structures final cse` finds CSE Data Structures finals. " +
        "The numeric id filters are for narrowing after a `list_filter_options` call. " +
        "Each result carries the question id needed by `get_question` and a `url` you can cite.",
      inputSchema: z.object({
        search: z
          .string()
          .trim()
          .min(1)
          .max(150)
          .optional()
          .describe(
            "Plain-language query, e.g. 'operating systems fall 24' or 'marketing final'.",
          ),
        departmentId: z.number().int().positive().optional(),
        courseId: z.number().int().positive().optional(),
        semesterId: z.number().int().positive().optional(),
        examTypeId: z.number().int().positive().optional(),
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
      }),
      outputSchema: z.object({
        questions: z.array(questionSchema),
        page: z.number().int(),
        perPage: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const { data, meta } = await listQuestions(getDb(env.DB), args);
      const questions = data.map((q) => ({ ...q, url: questionUrl(env, q.id) }));
      const output = { questions, ...meta };

      const text = questions.length
        ? `${meta.total} question${meta.total === 1 ? "" : "s"} matched (showing page ${meta.page} of ${meta.totalPages}):\n${questions.map(renderQuestionLine).join("\n")}`
        : "No questions matched. Try fewer words, or call list_filter_options to see the courses, semesters and exam types that exist.";

      return { content: [{ type: "text", text }], structuredContent: output };
    },
  );

  server.registerTool(
    "get_question",
    {
      title: "Get a question paper",
      description:
        "Fetch one question by id, together with every uploaded paper for it. " +
        "Each submission's `pdfUrl` is a directly downloadable PDF of the actual exam paper.",
      inputSchema: z.object({
        id: z.number().int().positive().describe("Question id from search_questions."),
      }),
      outputSchema: z.object({
        question: questionSchema,
        submissions: z.array(submissionSchema),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const db = getDb(env.DB);
      const question = await getQuestion(db, id);
      if (!question) {
        return {
          isError: true,
          content: [{ type: "text", text: `No question with id ${id}.` }],
        };
      }

      // The question exists, so this cannot be null; `?? []` keeps the types
      // honest without a second existence check.
      const submissions = (await listQuestionSubmissions(db, id)) ?? [];
      const output = {
        question: { ...question, url: questionUrl(env, id) },
        submissions,
      };

      const text = [
        `${question.title} (question #${question.id})`,
        `${question.department.name} · ${question.course.name} · ${question.semester.name} · ${question.examType.name}`,
        output.question.url,
        "",
        submissions.length
          ? `${submissions.length} paper${submissions.length === 1 ? "" : "s"}:\n${submissions.map(renderSubmissionLine).join("\n")}`
          : "No papers uploaded for this question yet.",
      ].join("\n");

      return { content: [{ type: "text", text }], structuredContent: output };
    },
  );

  server.registerTool(
    "list_filter_options",
    {
      title: "List departments, courses, semesters and exam types",
      description:
        "The full taxonomy behind the archive. Use it to see what exists before searching, or to get the ids for the numeric filters on `search_questions`.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        departments: z.array(departmentSchema),
        courses: z.array(courseSchema),
        semesters: z.array(lookupSchema),
        examTypes: z.array(lookupSchema),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const db = getDb(env.DB);

      const [departmentRows, courseRows, semesterRows, examTypeRows] =
        await Promise.all([
          db
            .select({
              id: departments.id,
              name: departments.name,
              shortName: departments.shortName,
            })
            .from(departments)
            .orderBy(asc(departments.name)),
          db
            .select({
              id: courses.id,
              departmentId: courses.departmentId,
              name: courses.name,
            })
            .from(courses)
            .orderBy(asc(courses.name)),
          db.select({ id: semesters.id, name: semesters.name }).from(semesters),
          db
            .select({ id: examTypes.id, name: examTypes.name })
            .from(examTypes)
            .orderBy(asc(examTypes.name)),
        ]);

      const output = {
        departments: departmentRows,
        courses: courseRows,
        // Latest year first, then Fall > Summer > Spring > Short within a year.
        semesters: sortSemesters(semesterRows),
        examTypes: examTypeRows,
      };

      const byDepartment = departmentRows.map((d) => {
        const names = courseRows
          .filter((course) => course.departmentId === d.id)
          .map((course) => `${course.name} (id ${course.id})`);
        return `${d.name} (${d.shortName}, id ${d.id}): ${names.join(", ") || "no courses yet"}`;
      });

      const text = [
        "Departments and their courses:",
        ...byDepartment,
        "",
        `Semesters: ${output.semesters.map((s) => `${s.name} (id ${s.id})`).join(", ")}`,
        `Exam types: ${examTypeRows.map((e) => `${e.name} (id ${e.id})`).join(", ")}`,
      ].join("\n");

      return { content: [{ type: "text", text }], structuredContent: output };
    },
  );

  return server;
};
