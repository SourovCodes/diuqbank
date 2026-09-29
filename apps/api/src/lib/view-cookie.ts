import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

/** A browser's repeat views of the same page within this window count once. */
export const VIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Most recent views remembered per browser, which keeps the cookie under ~1.5 KB. */
export const MAX_REMEMBERED_VIEWS = 100;

export const VIEW_COOKIE = "qb_views";

const MINUTE = 60 * 1000;

/**
 * The pages this browser was counted for in the last VIEW_WINDOW_MS, as
 * `q12_<minute>.s5_<minute>` (q = question page, s = paper; minutes since the epoch in
 * base 36). Kept in the browser rather than D1, so a repeat view costs no database
 * write. Students share a few campus IP addresses, so the browser, not the address,
 * is the visitor. Clearing the cookie only lets someone count again, which the view
 * token and bot checks on these routes are there to bound.
 */
export function readViews(c: Context, now = Date.now()) {
  const views = new Map<string, number>();
  const cutoff = now - VIEW_WINDOW_MS;
  for (const entry of (getCookie(c, VIEW_COOKIE) ?? "").split(".")) {
    const [key, minutes] = entry.split("_");
    const at = parseInt(minutes ?? "", 36) * MINUTE;
    if (key && /^[qs]\d+$/.test(key) && at > cutoff) views.set(key, at);
  }
  return views;
}

/** Remembers a counted view, dropping the oldest ones past MAX_REMEMBERED_VIEWS. */
export function rememberView(
  c: Context,
  views: Map<string, number>,
  key: string,
  now = Date.now(),
) {
  views.delete(key);
  views.set(key, now);
  const value = [...views]
    .slice(-MAX_REMEMBERED_VIEWS)
    .map(([k, at]) => `${k}_${Math.floor(at / MINUTE).toString(36)}`)
    .join(".");
  setCookie(c, VIEW_COOKIE, value, {
    path: "/api/v1",
    httpOnly: true,
    sameSite: "Lax",
    secure: new URL(c.req.url).protocol === "https:",
    maxAge: VIEW_WINDOW_MS / 1000,
  });
}
