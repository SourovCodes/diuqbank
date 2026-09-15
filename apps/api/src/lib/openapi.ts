import type { z } from "@hono/zod-openapi";
import { apiErrorSchema } from "@qb/shared";

export function jsonResponse<T extends z.ZodType>(
  schema: T,
  description: string,
) {
  return { description, content: { "application/json": { schema } } };
}

export function errorResponse(description: string) {
  return jsonResponse(apiErrorSchema, description);
}
