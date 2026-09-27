import api, { type QueueJob } from "@qb/api";
import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    // The API (and Better Auth) lives under /api/* on the same origin, so session
    // cookies stay first-party and no CORS is needed. Native apps call it here too.
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return api.fetch(request, env, ctx);
    }
    return requestHandler(request);
  },
  // Upload analysis and PDF watermarks (queue consumers in wrangler.jsonc).
  queue: api.queue,
} satisfies ExportedHandler<Env, QueueJob>;
