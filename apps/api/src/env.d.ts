// Secrets are not in wrangler.jsonc, so declare them here to keep types stable
// regardless of whether a local .dev.vars exists (e.g. in CI).
// `wrangler types` declares the global `Env` and `Cloudflare.Env` as separate
// interfaces, so the secret is added to both.
interface Env {
  BETTER_AUTH_SECRET: string;
}

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
  }
}
