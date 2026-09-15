import { env } from "cloudflare:workers";
import { data } from "react-router";

/**
 * Calls the API worker over its service binding on behalf of the incoming request,
 * forwarding the user's cookies so the API sees the same session as the browser.
 */
export function apiFetch(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const origin = new URL(request.url).origin;
  const headers = new Headers(init.headers);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("origin", origin);
  return env.API.fetch(new URL(path, origin), { ...init, headers });
}

export async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

/** GETs JSON from the API, turning any failure into a 502 error response. */
export async function apiGetJson<T>(
  request: Request,
  path: string,
): Promise<T> {
  const res = await apiFetch(request, path);
  if (!res.ok) throw data(`API request failed: ${path}`, { status: 502 });
  return readJson<T>(res);
}

/** Copies Set-Cookie headers from an API response so they can be sent to the browser. */
export function setCookieHeaders(res: Response) {
  const headers = new Headers();
  for (const cookie of res.headers.getSetCookie())
    headers.append("set-cookie", cookie);
  return headers;
}
