import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { secureHeaders } from "hono/secure-headers";
import { handleError, handleNotFound, validationHook } from "./lib/errors";
import { contextMiddleware } from "./middleware/context";
import { healthRoutes } from "./routes/health";
import { paperRoutes } from "./routes/papers";
import type { AppEnv } from "./types";

export function createApp() {
  const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

  app.use("*", secureHeaders());
  app.use("*", contextMiddleware);

  // Better Auth owns everything under /api/auth (sign-up, sign-in, sessions, ...).
  app.on(["GET", "POST"], "/api/auth/*", (c) => c.var.auth.handler(c.req.raw));

  const v1 = new OpenAPIHono<AppEnv>({ defaultHook: validationHook })
    .route("/", healthRoutes)
    .route("/papers", paperRoutes);
  app.route("/api/v1", v1);

  app.doc31("/api/v1/openapi.json", {
    openapi: "3.1.0",
    info: { title: "QuestionBank API", version: "1.0.0" },
  });
  app.get("/api/docs", Scalar({ url: "/api/v1/openapi.json" }));

  app.notFound(handleNotFound);
  app.onError(handleError);

  return app;
}
