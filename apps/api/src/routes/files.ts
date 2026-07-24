import { Hono } from "hono";

import type { AppEnv } from "../types";

const route = new Hono<AppEnv>();

// Local-dev-only convenience: streams an object straight from BUCKET so
// `fileUrlFor` URLs resolve to something that actually exists in `wrangler
// dev`'s local R2. This route is inert in production: it's gated on
// R2_PUBLIC_BASE being set, which only happens in local dev (see .dev.vars) —
// prod leaves it unset, `fileUrlFor` points at the public custom domain
// (r2.diuqbank.com) that Cloudflare serves directly, and this route 404s.
// That keeps the "the Worker does not proxy files in production" invariant
// enforced in code, not just by nobody linking here.
route.get("/*", async (c) => {
  if (!c.env.R2_PUBLIC_BASE) return c.json({ error: "Not found" }, 404);

  const key = c.req.path.replace(/^\/files\//, "");
  const object = await c.env.BUCKET.get(key);
  if (!object) return c.json({ error: "Not found" }, 404);

  c.header("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  return c.body(object.body);
});

export default route;
