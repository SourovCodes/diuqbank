import type { SubmissionCounts, SubmissionStatus } from "@qb/shared";
import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { percent } from "~/lib/format";
import { STATUS_LABELS } from "~/lib/submissions";

const SEGMENTS: {
  status: SubmissionStatus;
  key: keyof SubmissionCounts;
  icon: LucideIcon;
  fill: string;
}[] = [
  {
    status: "published",
    key: "published",
    icon: CheckCircle2,
    fill: "bg-emerald-500",
  },
  {
    status: "pending_review",
    key: "pendingReview",
    icon: Clock,
    fill: "bg-amber-500",
  },
  { status: "rejected", key: "rejected", icon: XCircle, fill: "bg-red-500" },
];

/** Part-to-whole of submissions by status: one stacked bar plus a labelled legend. */
export function StatusBreakdown({ counts }: { counts: SubmissionCounts }) {
  const total = counts.published + counts.pendingReview + counts.rejected;

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold">Submissions by status</h2>
          <p className="text-sm text-muted-foreground">
            Every paper ever uploaded
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight">{total}</p>
          <p className="text-xs text-muted-foreground">in total</p>
        </div>
      </div>

      {/* Segments are separated by a 2px gap, never a border. */}
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted">
        {SEGMENTS.map(({ status, key, fill }) =>
          counts[key] > 0 ? (
            <div
              key={status}
              className={fill}
              style={{ width: `${(counts[key] / total) * 100}%` }}
              title={`${STATUS_LABELS[status]}: ${counts[key]}`}
            />
          ) : null,
        )}
      </div>

      <ul className="grid gap-1">
        {SEGMENTS.map(({ status, key, icon: Icon, fill }) => (
          <li key={status}>
            <Link
              to={`/admin/submissions?status=${status}`}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <span className={`size-2.5 rounded-sm ${fill}`} aria-hidden />
              <Icon className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1">{STATUS_LABELS[status]}</span>
              <span className="font-medium tabular-nums">{counts[key]}</span>
              <span className="w-10 text-right text-muted-foreground tabular-nums">
                {percent(counts[key], total)}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
