import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  castVoteInputSchema,
  createdReportSchema,
  createReportInputSchema,
  idQuerySchema,
  questionInteractionsSchema,
  voteResultSchema,
} from "@qb/shared";
import { AppError, validationHook } from "../lib/errors";
import { errorResponse, jsonResponse } from "../lib/openapi";
import { requireAuth } from "../middleware/require-auth";
import {
  castVote,
  getQuestionInteractions,
  recordQuestionView,
  recordSubmissionView,
  removeVote,
  reportSubmission,
} from "../services/engagement";
import type { AppEnv } from "../types";

const tags = ["Engagement"];
const questionParams = z.object({ id: idQuerySchema });
const submissionParams = z.object({ id: idQuerySchema });
const jsonBody = <T extends z.ZodType>(schema: T) => ({
  required: true,
  content: { "application/json": { schema } },
});

const recordQuestionViewRoute = createRoute({
  method: "post",
  path: "/questions/{id}/views",
  tags,
  summary: "Count a question page view",
  description: "Public and unauthenticated: any visitor can count a view.",
  request: { params: questionParams },
  responses: {
    204: { description: "Counted" },
    404: errorResponse("Question not found"),
    422: errorResponse("Invalid id"),
  },
});

const recordSubmissionViewRoute = createRoute({
  method: "post",
  path: "/submissions/{id}/views",
  tags,
  summary: "Count a view of a published paper",
  description: "Public and unauthenticated: any visitor can count a view.",
  request: { params: submissionParams },
  responses: {
    204: { description: "Counted" },
    404: errorResponse("Submission not found or not published"),
  },
});

const castVoteRoute = createRoute({
  method: "put",
  path: "/submissions/{id}/vote",
  tags,
  summary: "Like (1) or dislike (-1) a published paper",
  middleware: [requireAuth] as const,
  request: {
    params: submissionParams,
    body: jsonBody(castVoteInputSchema),
  },
  responses: {
    200: jsonResponse(voteResultSchema, "Updated counts and your vote"),
    401: errorResponse("Not signed in"),
    403: errorResponse("You can't vote on your own paper"),
    404: errorResponse("Submission not found or not published"),
    422: errorResponse("Invalid vote"),
  },
});

const removeVoteRoute = createRoute({
  method: "delete",
  path: "/submissions/{id}/vote",
  tags,
  summary: "Remove your like or dislike",
  middleware: [requireAuth] as const,
  request: { params: submissionParams },
  responses: {
    200: jsonResponse(voteResultSchema, "Updated counts"),
    401: errorResponse("Not signed in"),
    403: errorResponse("You can't vote on your own paper"),
    404: errorResponse("Submission not found or not published"),
  },
});

const reportSubmissionRoute = createRoute({
  method: "post",
  path: "/submissions/{id}/reports",
  tags,
  summary: "Report a problem with a published paper",
  description:
    "Reports are reviewed by an admin. A paper with 3 open reports from different users is hidden (moved back to pending review) automatically.",
  middleware: [requireAuth] as const,
  request: {
    params: submissionParams,
    body: jsonBody(createReportInputSchema),
  },
  responses: {
    201: jsonResponse(createdReportSchema, "Report filed"),
    401: errorResponse("Not signed in"),
    403: errorResponse("You can't report your own paper"),
    404: errorResponse("Submission not found or not published"),
    409: errorResponse("You already have an open report on this paper"),
    422: errorResponse("Invalid report"),
  },
});

const questionInteractionsRoute = createRoute({
  method: "get",
  path: "/me/questions/{id}/interactions",
  tags,
  summary: "Your votes and open reports on a question's papers",
  middleware: [requireAuth] as const,
  request: { params: questionParams },
  responses: {
    200: jsonResponse(questionInteractionsSchema, "Your interactions"),
    401: errorResponse("Not signed in"),
    422: errorResponse("Invalid id"),
  },
});

export const engagementRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
})
  .openapi(recordQuestionViewRoute, async (c) => {
    if (!(await recordQuestionView(c.var.db, c.req.valid("param").id))) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }
    return c.body(null, 204);
  })
  .openapi(recordSubmissionViewRoute, async (c) => {
    if (!(await recordSubmissionView(c.var.db, c.req.valid("param").id))) {
      throw new AppError(404, "NOT_FOUND", "Submission not found");
    }
    return c.body(null, 204);
  })
  .openapi(castVoteRoute, async (c) =>
    c.json(
      await castVote(
        c.var.db,
        c.req.valid("param").id,
        c.var.session!.user.id,
        c.req.valid("json").value,
      ),
      200,
    ),
  )
  .openapi(removeVoteRoute, async (c) =>
    c.json(
      await removeVote(
        c.var.db,
        c.req.valid("param").id,
        c.var.session!.user.id,
      ),
      200,
    ),
  )
  .openapi(reportSubmissionRoute, async (c) =>
    c.json(
      await reportSubmission(
        c.var.db,
        c.req.valid("param").id,
        c.var.session!.user.id,
        c.req.valid("json"),
      ),
      201,
    ),
  )
  .openapi(questionInteractionsRoute, async (c) =>
    c.json(
      await getQuestionInteractions(
        c.var.db,
        c.req.valid("param").id,
        c.var.session!.user.id,
      ),
      200,
    ),
  );
