// Fixed time zone so server and client render the same string (no hydration mismatch).
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}
