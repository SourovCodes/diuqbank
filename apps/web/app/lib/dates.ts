// Fixed time zone so server and client render the same string (no hydration mismatch).
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

/** e.g. "September 2025" */
export function formatMonth(iso: string) {
  return monthFormatter.format(new Date(iso));
}

const dayFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** e.g. "Sep 24", for a date or an ISO timestamp. */
export function formatDay(iso: string) {
  return dayFormatter.format(new Date(iso));
}
