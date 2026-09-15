import { redirect } from "react-router";
import { apiFetch, readJson } from "./api.server";
import type { SessionUser } from "./types";

// Matches both `better-auth.session_token` (http) and `__Secure-better-auth.session_token` (https).
const SESSION_COOKIE = "better-auth.session_token";

export async function getUser(request: Request): Promise<SessionUser | null> {
  // Most visitors never sign in: skip the API round-trip when there is no session cookie.
  if (!request.headers.get("cookie")?.includes(SESSION_COOKIE)) return null;

  const res = await apiFetch(request, "/api/auth/get-session");
  if (!res.ok) return null;
  const data = await readJson<{ user: SessionUser } | null>(res);
  return data?.user ?? null;
}

export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getUser(request);
  if (!user) {
    const { pathname, search } = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(pathname + search)}`,
    );
  }
  return user;
}
