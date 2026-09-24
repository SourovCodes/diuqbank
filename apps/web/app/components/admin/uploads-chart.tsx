import type { AdminStats } from "@qb/shared";
import { useState } from "react";
import { formatDay } from "~/lib/dates";
import { niceCeiling } from "~/lib/format";
import { plural } from "~/lib/submissions";
import { cn } from "~/lib/utils";

type Day = AdminStats["dailySubmissions"][number];

const PLOT_HEIGHT = 160;

/**
 * Uploads per day as one series of columns. Hover or arrow keys show a day's count;
 * the busiest day is labelled, and a table carries every value for screen readers.
 */
export function UploadsChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const peak = days.reduce(
    (best, day, i) => (day.count > (days[best]?.count ?? 0) ? i : best),
    0,
  );
  const top = niceCeiling(days[peak]?.count ?? 0);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = days.length - 1;
    const current = active ?? last;
    const next =
      event.key === "ArrowLeft"
        ? Math.max(0, current - 1)
        : event.key === "ArrowRight"
          ? Math.min(last, current + 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next !== null) {
      event.preventDefault();
      setActive(next);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold">Uploads</h2>
          <p className="text-sm text-muted-foreground">
            New submissions per day, last {days.length} days
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight">{total}</p>
          <p className="text-xs text-muted-foreground">in total</p>
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
        {/* Y axis: the round maximum and zero. */}
        <div
          aria-hidden
          className="flex flex-col justify-between text-right text-xs text-muted-foreground tabular-nums"
          style={{ height: PLOT_HEIGHT }}
        >
          <span className="-translate-y-1/2">{top}</span>
          <span className="translate-y-1/2">0</span>
        </div>

        <div
          role="img"
          aria-label={`${plural(total, "upload")} in the last ${days.length} days${
            total > 0
              ? `, most on ${formatDay(days[peak]!.date)} (${days[peak]!.count})`
              : ""
          }`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="relative rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          style={{ height: PLOT_HEIGHT }}
        >
          {/* Hairline gridlines at the top and the baseline. */}
          <div className="absolute inset-x-0 top-0 border-t" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 border-t" aria-hidden />

          <div className="absolute inset-0 flex items-end">
            {days.map((day, i) => {
              const height = (day.count / top) * PLOT_HEIGHT;
              return (
                <div
                  key={day.date}
                  onPointerEnter={() => setActive(i)}
                  className={cn(
                    "relative flex h-full flex-1 items-end justify-center px-px",
                    active === i && "bg-muted/70",
                  )}
                >
                  {day.count > 0 && (
                    <div
                      className={cn(
                        "w-full max-w-6 rounded-t-[4px] bg-primary transition-opacity",
                        active !== null && active !== i && "opacity-60",
                      )}
                      style={{ height: Math.max(height, 2) }}
                    />
                  )}
                  {i === peak && day.count > 0 && active === null && (
                    <span
                      className="absolute text-xs font-medium tabular-nums"
                      style={{ bottom: height + 4 }}
                      aria-hidden
                    >
                      {day.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {total === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No uploads in the last {days.length} days
            </p>
          )}

          {active !== null && days[active] && total > 0 && (
            <div
              aria-live="polite"
              className={cn(
                "pointer-events-none absolute top-2 z-10 rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md",
                // Beside the column, on whichever side has room.
                active < days.length / 2 ? "ml-3" : "-ml-3 -translate-x-full",
              )}
              style={{
                left: `${((active + 0.5) / days.length) * 100}%`,
              }}
            >
              <p className="font-semibold text-foreground">
                {plural(days[active].count, "upload")}
              </p>
              <p className="text-muted-foreground">
                {formatDay(days[active].date)}
              </p>
            </div>
          )}
        </div>

        {/* X axis: first, middle and last day. */}
        <div />
        <div
          aria-hidden
          className="flex justify-between pt-2 text-xs text-muted-foreground"
        >
          <span>{days[0] && formatDay(days[0].date)}</span>
          <span>
            {days[Math.floor(days.length / 2)] &&
              formatDay(days[Math.floor(days.length / 2)]!.date)}
          </span>
          <span>Today</span>
        </div>
      </div>

      <table className="sr-only">
        <caption>Uploads per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Uploads</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{formatDay(day.date)}</td>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
