import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import { createMcpHandler } from "agents/mcp/server";

import { handleScheduled } from "./cron";
import { createServer as createMcpServer } from "./mcp";
import { openApiDoc } from "./openapi";
import { handleQueue } from "./queue";
import { MAX_PDF_BYTES } from "@diuqbank/shared";
import admin from "./routes/admin";
import auth from "./routes/auth";
import autoSubmissions from "./routes/auto-submissions";
import contributors from "./routes/contributors";
import filterOptions from "./routes/filter-options";
import files from "./routes/files";
import manualSubmissions from "./routes/manual-submissions";
import questions from "./routes/questions";
import submissions from "./routes/submissions";
import type { AppEnv, Bindings } from "./types";
import { setR2PublicBase } from "./lib/user-shape";

const app = new Hono<AppEnv>();

/** Pathname of the MCP endpoint. Exempt from the web CORS allowlist below. */
const MCP_ROUTE = "/mcp";

// Sync the module-level R2 base used by fileUrlFor (src/lib/user-shape.ts)
// with this env's R2_PUBLIC_BASE before any handler builds a response. Must
// run first — every downstream handler that shapes a DTO relies on it.
// R2_PUBLIC_BASE is unset in production (falls back to fileUrlFor's real
// r2.diuqbank.com default); .dev.vars sets it locally to this Worker's own
// /files/* route (see wrangler.jsonc's `secrets.required` for why it has to
// live there rather than in `vars`, even though it isn't actually secret).
app.use("*", async (c, next) => {
  if (c.env.R2_PUBLIC_BASE) setR2PublicBase(c.env.R2_PUBLIC_BASE);
  await next();
});

const allowedWebOrigins = (env: Bindings) =>
  env.WEB_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const frameAncestorPolicy = (env: Bindings) => {
  const ancestors = new Set<string>(["'self'"]);

  for (const origin of allowedWebOrigins(env)) {
    try {
      const url = new URL(origin);
      if (url.protocol === "http:" || url.protocol === "https:") {
        ancestors.add(url.origin);
      }
    } catch {
      // Invalid CORS entries are ignored for CSP rather than emitting a bad header.
    }
  }

  return `frame-ancestors ${Array.from(ancestors).join(" ")};`;
};

// Tag every request with an id (echoed as X-Request-Id) for log correlation.
app.use("*", requestId());
app.use("*", logger());

// Allow only this API and the configured web frontends to iframe API pages/files.
// This must wrap secureHeaders so it can replace X-Frame-Options (which cannot
// express an allowlist) with the modern CSP frame-ancestors directive. It also
// relaxes Cross-Origin-Resource-Policy for the local-dev-only /files/* route
// (routes/files.ts) — secureHeaders sets CORP in its own post-next() phase,
// which runs after that route's handler and would otherwise stomp its header,
// blocking the local web dev server (a different origin/port) from loading
// files as <img>/PDF resources. Registering this middleware *before*
// secureHeaders means its own post-next() code runs *after* secureHeaders',
// so its overrides win. Production never hits /files/*, so this is a no-op
// there (see comment on secureHeaders below).
app.use("*", async (c, next) => {
  await next();
  c.res.headers.delete("X-Frame-Options");
  c.res.headers.set("Content-Security-Policy", frameAncestorPolicy(c.env as Bindings));
  if (c.req.path.startsWith("/files/")) {
    c.res.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
});

// Security headers. CSP is limited to frame-ancestors above so the Scalar /docs
// page (which loads from jsdelivr) keeps working. Files are served from the R2
// public domain (r2.diuqbank.com) in production, not this Worker, so CORP is
// left strict here; the /files/* route relaxes it above for local dev.
app.use("*", secureHeaders({ xFrameOptions: "DENY" }));

// CORS locked to an env-configured allowlist (WEB_ORIGINS, comma-separated).
// Requests from any other Origin get no CORS headers and are blocked by the
// browser. The token travels in the Authorization header, so credentials off.
//
// `/mcp` is deliberately exempt: MCP clients are not the web frontend and would
// all be rejected by this allowlist. That route does its own Host/Origin
// validation and emits its own CORS headers (see the mount below).
const webCors = cors({
  origin: (origin, c) => {
    const env = c.env as Bindings;
    return allowedWebOrigins(env).includes(origin) ? origin : null;
  },
  allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Authorization", "Content-Type"],
  maxAge: 86400,
});
app.use("*", (c, next) =>
  c.req.path === MCP_ROUTE ? next() : webCors(c, next),
);

// Body size guards. JSON (and other non-multipart) bodies are capped at 256 KB.
// Multipart uploads legitimately reach 20 MB (and self-validate their own size
// per field), but still get a hard ceiling so a spoofed `multipart/form-data`
// content-type can't stream an unbounded body into a JSON route.
const jsonBodyLimit = bodyLimit({
  maxSize: 256 * 1024,
  onError: (c) => c.json({ error: "Payload too large" }, 413),
});
const multipartBodyLimit = bodyLimit({
  maxSize: MAX_PDF_BYTES + 512 * 1024, // largest upload + multipart overhead
  onError: (c) => c.json({ error: "Payload too large" }, 413),
});
app.use("*", (c, next) =>
  (c.req.header("content-type") ?? "").includes("multipart/form-data")
    ? multipartBodyLimit(c, next)
    : jsonBodyLimit(c, next),
);

app.get("/", (c) =>
  c.json({
    ok: true,
    service: "diuqbank",
    docs: "/docs",
    openapi: "/openapi.json",
    mcp: MCP_ROUTE,
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/openapi.json", (c) => c.json(openApiDoc));

app.get("/docs", (c) =>
  c.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>DIU QuestionBank API — Reference</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`),
);

// Model Context Protocol endpoint, so AI assistants and agents can search the
// archive and pull question papers directly (tools defined in src/mcp.ts).
// Stateless per the 2026-07-28 spec — no Durable Object and no session store —
// so the handler is built per request, closing over that request's env.
//
// `allowedOriginHostnames: "*"` accepts browser-based MCP clients from any
// origin. The handler's default (localhost + this Worker's own hostname) exists
// to stop a malicious page from driving a server that acts with the victim's
// ambient authority — the classic DNS-rebinding target being an MCP server
// bound to localhost. Neither half of that applies here: this server is on the
// public internet, every tool is anonymous and read-only, and it reads nothing
// but data already served publicly at diuqbank.com. A hostile page calling it
// learns exactly what it could have fetched server-side, so the default would
// only lock out legitimate clients. Do not copy this line onto an endpoint that
// gains any write, any auth, or any per-user data.
app.all(MCP_ROUTE, (c) => {
  const handler = createMcpHandler(() => createMcpServer(c.env as Bindings), {
    route: MCP_ROUTE,
    allowedOriginHostnames: "*",
  });
  // Hono ships its own structural `ExecutionContext` (waitUntil +
  // passThroughOnException); the handler wants the workers-types one, which
  // also declares `tracing`. Same runtime object, so cast rather than thread a
  // second context through.
  return handler(c.req.raw, c.env, c.executionCtx as unknown as ExecutionContext);
});

app.route("/auth", auth);
app.route("/contributors", contributors);
app.route("/questions", questions);
app.route("/submissions", submissions);
app.route("/filter-options", filterOptions);
app.route("/auto-submissions", autoSubmissions);
app.route("/manual-submissions", manualSubmissions);
app.route("/admin", admin);
app.route("/files", files);

// ---------------------------------------------------------------------------
// Error handling: HTTPException passthrough, then map common D1 constraint
// failures to clean client errors.
// ---------------------------------------------------------------------------

const walkErrorMessages = (err: unknown): string[] => {
  const out: string[] = [];
  let current: unknown = err;
  const seen = new Set<unknown>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const msg = (current as { message?: unknown }).message;
    if (typeof msg === "string") out.push(msg);
    current = (current as { cause?: unknown }).cause;
  }
  return out;
};

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  const joined = walkErrorMessages(err).join(" | ");

  const unique = joined.match(/UNIQUE constraint failed: ([\w., ]+)/);
  if (unique) {
    const cols = unique[1]
      .split(",")
      .map((s) => s.trim().split(".").pop() ?? "")
      .filter(Boolean);
    const message =
      cols.length === 1
        ? `${cols[0]} already exists`
        : `combination of ${cols.join(", ")} already exists`;
    return c.json({ error: message }, 409);
  }

  if (/FOREIGN KEY constraint failed/i.test(joined)) {
    return c.json({ error: "Referenced record does not exist" }, 400);
  }

  const notNull = joined.match(/NOT NULL constraint failed: \w+\.(\w+)/);
  if (notNull) {
    return c.json({ error: `${notNull[1]} is required` }, 400);
  }

  console.error(`Unhandled error [${c.get("requestId")}]`, err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

// The Worker exports the HTTP handler, the queue consumer, and the cron
// consumer. The queue handler drains both throttled queues — PDF_QUEUE
// (watermarking; bounds PDF Processor load) and GEMINI_QUEUE (AI
// auto-submission; concurrency 1 so Gemini calls never overlap). The
// scheduled handler flushes buffered submission views from Analytics Engine
// into D1 every 15 minutes (see src/cron.ts).
export default {
  fetch: app.fetch,
  queue: handleQueue,
  scheduled: handleScheduled,
};
