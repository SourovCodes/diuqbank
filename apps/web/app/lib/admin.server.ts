import type { ApiError } from "@qb/shared";
import { data, redirect } from "react-router";
import { apiFetch, readJson } from "./api.server";
import { fieldErrorsFrom } from "./api-errors";

/** What an admin form action returns to its fetcher. */
export type AdminActionResult =
  | { ok: true; intent: string }
  | {
      ok: false;
      intent: string;
      error: string;
      fieldErrors: Record<string, string>;
    };

/**
 * Calls an admin API endpoint (`/api/v1/admin{path}`) on behalf of the signed-in admin
 * and turns the response into a result for the form that triggered it.
 */
export async function adminRequest(
  request: Request,
  intent: string,
  method: string,
  path: string,
  body?: unknown,
) {
  const res = await apiFetch(request, `/api/v1/admin${path}`, {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  if (res.ok) return data<AdminActionResult>({ ok: true, intent });

  const error = await readJson<ApiError>(res).catch(() => null);
  const fieldErrors = fieldErrorsFrom(error);
  return data<AdminActionResult>(
    {
      ok: false,
      intent,
      error:
        Object.keys(fieldErrors).length > 0
          ? "Check the highlighted fields."
          : (error?.error.message ?? "Something went wrong. Please try again."),
      fieldErrors,
    },
    // 4xx skips revalidation: nothing changed.
    { status: res.status >= 500 ? 502 : res.status },
  );
}

/** Form fields as a plain object, leaving out empty values. */
export function formObject(form: FormData, ...skip: string[]) {
  const entries = [...form.entries()].filter(
    ([key, value]) =>
      !skip.includes(key) && typeof value === "string" && value.trim() !== "",
  );
  return Object.fromEntries(entries) as Record<string, string>;
}

/**
 * GETs JSON from an admin endpoint for a loader. Non-admins get the same 404 as
 * `requireAdmin` gives them, and missing records a 404 too.
 */
export async function adminGetJson<T>(
  request: Request,
  path: string,
): Promise<T> {
  const res = await apiFetch(request, `/api/v1/admin${path}`);
  if (res.status === 401) {
    const { pathname, search } = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(pathname + search)}`,
    );
  }
  if (res.status === 403 || res.status === 404 || res.status === 422) {
    throw data("Not found", { status: 404 });
  }
  if (!res.ok) throw data(`API request failed: ${path}`, { status: 502 });
  return readJson<T>(res);
}
