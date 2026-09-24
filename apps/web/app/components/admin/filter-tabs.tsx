import { Link } from "react-router";
import { formatCount } from "~/lib/format";
import { cn } from "~/lib/utils";

export type FilterTab = {
  /** Search string for the tab, e.g. "?status=published", or "" for the default. */
  search: string;
  label: string;
  count?: number;
  active: boolean;
};

/** Underlined tabs that switch a list's filter through the URL. */
export function FilterTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: FilterTab[];
}) {
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          to={{ search: tab.search }}
          preventScrollReset
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            tab.active
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                tab.active
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {formatCount(tab.count)}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
