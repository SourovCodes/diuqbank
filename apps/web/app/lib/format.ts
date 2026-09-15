const UNITS = ["KB", "MB", "GB"] as const;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${UNITS[unit]}`;
}

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Short counts for badges and toolbars, e.g. 1234 → "1.2K". */
export function formatCount(count: number): string {
  return compact.format(count);
}

export function formatViews(count: number): string {
  return `${formatCount(count)} ${count === 1 ? "view" : "views"}`;
}
