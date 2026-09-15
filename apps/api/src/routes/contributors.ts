import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  contributorDetailSchema,
  contributorListSchema,
  listContributorsQuerySchema,
} from "@qb/shared";
import { AppError, validationHook } from "../lib/errors";
import { errorResponse, jsonResponse } from "../lib/openapi";
import { getContributor, listContributors } from "../services/contributors";
import type { AppEnv } from "../types";

const tags = ["Contributors"];

const listContributorsRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "List users who have submitted papers, most published first",
  request: { query: listContributorsQuerySchema },
  responses: {
    200: jsonResponse(contributorListSchema, "Contributors"),
    422: errorResponse("Invalid query"),
  },
});

const getContributorRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags,
  summary: "Get a contributor with their submissions",
  request: { params: z.object({ id: z.string().min(1) }) },
  responses: {
    200: jsonResponse(contributorDetailSchema, "Contributor"),
    404: errorResponse("Contributor not found"),
  },
});

export const contributorRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
})
  .openapi(listContributorsRoute, async (c) =>
    c.json(await listContributors(c.var.db, c.req.valid("query")), 200),
  )
  .openapi(getContributorRoute, async (c) => {
    const contributor = await getContributor(c.var.db, c.req.valid("param").id);
    if (!contributor) {
      throw new AppError(404, "NOT_FOUND", "Contributor not found");
    }
    return c.json(contributor, 200);
  });
