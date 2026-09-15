import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { mySubmissionListSchema } from "@qb/shared";
import { AppError, validationHook } from "../lib/errors";
import { objectResponse } from "../lib/files";
import { errorResponse, jsonResponse } from "../lib/openapi";
import { requireAuth } from "../middleware/require-auth";
import { getOwnSubmissionFile, withdrawSubmission } from "../services/account";
import { listUploaderSubmissions } from "../services/contributors";
import type { AppEnv } from "../types";

const tags = ["Account"];
const idParams = z.object({ id: z.string().min(1) });

const listMySubmissionsRoute = createRoute({
  method: "get",
  path: "/submissions",
  tags,
  summary: "List your own submissions, in every status",
  middleware: [requireAuth] as const,
  responses: {
    200: jsonResponse(mySubmissionListSchema, "Your submissions"),
    401: errorResponse("Not signed in"),
  },
});

const getMySubmissionFileRoute = createRoute({
  method: "get",
  path: "/submissions/{id}/file",
  tags,
  summary: "Download the PDF of one of your submissions, in any status",
  middleware: [requireAuth] as const,
  request: { params: idParams },
  responses: {
    200: {
      description: "PDF file",
      content: {
        "application/pdf": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
    },
    401: errorResponse("Not signed in"),
    404: errorResponse("Submission not found"),
  },
});

const withdrawMySubmissionRoute = createRoute({
  method: "delete",
  path: "/submissions/{id}",
  tags,
  summary: "Withdraw one of your submissions that isn't published",
  middleware: [requireAuth] as const,
  request: { params: idParams },
  responses: {
    204: { description: "Withdrawn; the PDF is deleted" },
    401: errorResponse("Not signed in"),
    404: errorResponse("Submission not found"),
    409: errorResponse("Published submissions can't be withdrawn"),
  },
});

export const meRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
})
  .openapi(listMySubmissionsRoute, async (c) =>
    c.json(
      {
        items: await listUploaderSubmissions(c.var.db, c.var.session!.user.id),
      },
      200,
    ),
  )
  .openapi(getMySubmissionFileRoute, async (c) => {
    const object = await getOwnSubmissionFile(
      c.var.db,
      c.env.BUCKET,
      c.var.session!.user.id,
      c.req.valid("param").id,
    );
    if (!object) throw new AppError(404, "NOT_FOUND", "Submission not found");
    // Unpublished papers are private to their uploader: never cache them in shared caches.
    return objectResponse(object, "private, no-store");
  })
  .openapi(withdrawMySubmissionRoute, async (c) => {
    await withdrawSubmission(
      c.var.db,
      c.env.BUCKET,
      c.var.session!.user.id,
      c.req.valid("param").id,
    );
    return c.body(null, 204);
  });
