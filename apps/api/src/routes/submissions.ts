import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AppError, validationHook } from "../lib/errors";
import { errorResponse } from "../lib/openapi";
import { getPublishedSubmissionFile } from "../services/questions";
import type { AppEnv } from "../types";

const getSubmissionFileRoute = createRoute({
  method: "get",
  path: "/{id}/file",
  tags: ["Submissions"],
  summary: "Download the PDF of a published submission",
  request: { params: z.object({ id: z.string().min(1) }) },
  responses: {
    200: {
      description: "PDF file",
      content: {
        "application/pdf": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
    },
    404: errorResponse("Submission not found"),
  },
});

export const submissionRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
}).openapi(getSubmissionFileRoute, async (c) => {
  const object = await getPublishedSubmissionFile(
    c.var.db,
    c.env.BUCKET,
    c.req.valid("param").id,
  );
  if (!object) throw new AppError(404, "NOT_FOUND", "Submission not found");

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-length", String(object.size));
  headers.set("cache-control", "public, max-age=86400");
  return new Response(object.body, { status: 200, headers });
});
