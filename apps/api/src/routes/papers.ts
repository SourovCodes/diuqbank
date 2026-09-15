import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  apiErrorSchema,
  createPaperInputSchema,
  listPapersQuerySchema,
  paperListSchema,
  paperSchema,
} from "@qb/shared";
import { AppError, validationHook } from "../lib/errors";
import { requireAuth } from "../middleware/require-auth";
import {
  createPaper,
  getApprovedPaper,
  getPaperFile,
  listApprovedPapers,
} from "../services/papers";
import type { AppEnv } from "../types";

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: apiErrorSchema } },
});

const idParams = z.object({ id: z.string().min(1) });

const listPapersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Papers"],
  summary: "List approved papers",
  request: { query: listPapersQuerySchema },
  responses: {
    200: {
      description: "Papers",
      content: { "application/json": { schema: paperListSchema } },
    },
    422: errorResponse("Invalid query"),
  },
});

const getPaperRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Papers"],
  summary: "Get an approved paper",
  request: { params: idParams },
  responses: {
    200: {
      description: "Paper",
      content: { "application/json": { schema: paperSchema } },
    },
    404: errorResponse("Paper not found"),
  },
});

const getPaperFileRoute = createRoute({
  method: "get",
  path: "/{id}/file",
  tags: ["Papers"],
  summary: "Download the PDF of an approved paper",
  request: { params: idParams },
  responses: {
    200: {
      description: "PDF file",
      content: {
        "application/pdf": { schema: z.string().openapi({ format: "binary" }) },
      },
    },
    404: errorResponse("Paper not found"),
  },
});

const createPaperRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Papers"],
  summary: "Contribute a question paper (requires sign-in)",
  middleware: [requireAuth] as const,
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: createPaperInputSchema.extend({
            file: z
              .instanceof(File)
              .openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Paper submitted for review",
      content: { "application/json": { schema: paperSchema } },
    },
    400: errorResponse("Invalid file"),
    401: errorResponse("Not signed in"),
    422: errorResponse("Invalid metadata"),
  },
});

export const paperRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
})
  .openapi(listPapersRoute, async (c) => {
    const result = await listApprovedPapers(c.var.db, c.req.valid("query"));
    return c.json(result, 200);
  })
  .openapi(getPaperRoute, async (c) => {
    const paper = await getApprovedPaper(c.var.db, c.req.valid("param").id);
    if (!paper) throw new AppError(404, "NOT_FOUND", "Paper not found");
    return c.json(paper, 200);
  })
  .openapi(getPaperFileRoute, async (c) => {
    const object = await getPaperFile(
      c.var.db,
      c.env.BUCKET,
      c.req.valid("param").id,
    );
    if (!object) throw new AppError(404, "NOT_FOUND", "Paper not found");

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("content-length", String(object.size));
    headers.set("cache-control", "public, max-age=86400");
    return new Response(object.body, { status: 200, headers });
  })
  .openapi(createPaperRoute, async (c) => {
    const { file, ...input } = c.req.valid("form");
    const paper = await createPaper(c.var.db, c.env.BUCKET, {
      input,
      file,
      uploaderId: c.var.session!.user.id,
    });
    return c.json(paper, 201);
  });
