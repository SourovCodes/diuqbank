import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env) {
    // Browsers only ever talk to this origin: API and auth calls are forwarded to the
    // API worker, so session cookies stay first-party and no CORS is needed.
    // Native apps call the API worker directly.
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return env.API.fetch(request);
    }
    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
