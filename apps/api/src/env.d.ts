// Secrets are not in wrangler.jsonc, so declare them here to keep types stable
// regardless of whether a local .dev.vars exists (e.g. in CI).
declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
  }
}
