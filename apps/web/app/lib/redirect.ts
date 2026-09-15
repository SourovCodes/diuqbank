/** Only allows same-site relative paths, preventing open redirects via `?redirectTo=`. */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  fallback = "/",
) {
  if (
    typeof to !== "string" ||
    !to.startsWith("/") ||
    to.startsWith("//") ||
    to.startsWith("/\\")
  ) {
    return fallback;
  }
  return to;
}
