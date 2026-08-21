import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { getDb } from "../db/client";
import { withCache } from "../lib/cache";
import { parseId } from "../lib/parse-id";
import {
  getQuestion,
  listQuestionSubmissions,
  listQuestions,
} from "../lib/questions-query";
import { validate } from "../lib/validator";
import { questionsListQuery } from "../shared/schemas/questions";
import type { AppEnv } from "../types";

const questionRoutes = new Hono<AppEnv>();

questionRoutes.get("/", validate("query", questionsListQuery), (c) => {
  const params = c.req.valid("query");
  const { page, perPage, search, departmentId, courseId, semesterId, examTypeId } =
    params;

  // Cached on `q:list`; bumped whenever a question or submission is created or
  // removed, or taxonomy changes (titles/filters). `search` is part of the key —
  // without it every query would collide on the same entry.
  const key = `questions:list:${page}:${perPage}:${departmentId ?? ""}:${courseId ?? ""}:${semesterId ?? ""}:${examTypeId ?? ""}:${search ?? ""}`;

  return withCache(c, { versions: ["q:list"], key }, () =>
    listQuestions(getDb(c.env.DB), params),
  );
});

questionRoutes.get("/:id", (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    throw new HTTPException(404, { message: "Question not found" });
  }

  // Depends on this question (`q:<id>`) and the taxonomy names in its title (`tax`).
  return withCache(c, { versions: [`q:${id}`, "tax"], key: `questions:${id}` }, async () => {
    const question = await getQuestion(getDb(c.env.DB), id);
    if (!question) {
      throw new HTTPException(404, { message: "Question not found" });
    }
    return question;
  });
});

// All submissions for a question (no pagination — a single question has few).
questionRoutes.get("/:id/submissions", (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    throw new HTTPException(404, { message: "Question not found" });
  }

  // Depends on this question's submissions (`q:<id>`) and on `tax`: a taxonomy
  // merge can move submissions between questions (or delete this question)
  // without touching the `q:<id>` token, so `tax` closes that staleness gap.
  // Contributor name/avatar drift in this list is bounded by the cache TTL.
  return withCache(
    c,
    { versions: [`q:${id}`, "tax"], key: `questions:${id}:submissions` },
    async () => {
      const data = await listQuestionSubmissions(getDb(c.env.DB), id);
      // Null means the question itself is gone — a clear 404, not an empty list.
      if (!data) {
        throw new HTTPException(404, { message: "Question not found" });
      }
      return { data };
    },
  );
});

export default questionRoutes;
