// Merged into the generated global `Env` (worker-configuration.d.ts).
// R2_PUBLIC_BASE is deliberately absent from wrangler.jsonc's
// `secrets.required` — wrangler blocks `deploy` while a required secret is
// unset, and this one must stay unset in production (see wrangler.jsonc) —
// so `wrangler types` doesn't know about it and it's typed here instead.
interface Env {
  /**
   * Base URL prefixed onto stored object keys by fileUrlFor. Set only in
   * local dev (`.dev.vars`, pointing at this Worker's own /files/* route);
   * never in production, where fileUrlFor falls back to the real
   * r2.diuqbank.com.
   */
  R2_PUBLIC_BASE?: string;
}
