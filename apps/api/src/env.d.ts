// Secrets are not in wrangler.jsonc, so declare them here to keep types stable
// regardless of whether a local .dev.vars exists (e.g. in CI).
// `wrangler types` declares the global `Env` and `Cloudflare.Env` as separate
// interfaces, so the secrets are added to both.
// GEMINI_API_KEY and COMPRESSOR_API_KEY may be unset locally; AI analysis then fails
// as "not configured".
interface Env {
  BETTER_AUTH_SECRET: string;
  GEMINI_API_KEY: string;
  COMPRESSOR_API_KEY: string;
}

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
    GEMINI_API_KEY: string;
    COMPRESSOR_API_KEY: string;
  }
}
