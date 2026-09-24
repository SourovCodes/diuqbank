import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { formatCount } from "~/lib/format";
import { cn } from "~/lib/utils";

type StatTileProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Secondary line under the value. */
  caption?: React.ReactNode;
  to?: string;
  /** Highlights a queue that needs an admin: amber while the value is above zero. */
  attention?: boolean;
};

/** One headline number: label, value, caption. Links to where it can be acted on. */
export function StatTile({
  label,
  value,
  icon: Icon,
  caption,
  to,
  attention = false,
}: StatTileProps) {
  const needsAction = attention && value > 0;
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "rounded-lg p-2",
            needsAction
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {formatCount(value)}
      </p>
      {caption && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {caption}
        </p>
      )}
      {to && (
        <ArrowUpRight
          className="absolute right-3 bottom-3 size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100"
          aria-hidden
        />
      )}
    </>
  );
  const className =
    "group relative flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm sm:p-5";

  return to ? (
    <Link
      to={to}
      prefetch="intent"
      className={cn(
        className,
        "transition hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
