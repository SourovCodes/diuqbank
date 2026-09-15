import type { Contributor } from "@qb/shared";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { Badge } from "~/components/ui/badge";
import { formatMonth } from "~/lib/dates";
import { plural } from "~/lib/submissions";

export function ContributorCard({ contributor }: { contributor: Contributor }) {
  const { published, pendingReview } = contributor.submissionCounts;
  return (
    <Link
      to={`/contributors/${encodeURIComponent(contributor.id)}`}
      prefetch="intent"
      className="group flex h-full items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ContributorAvatar name={contributor.name} />
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate font-medium group-hover:text-primary">
          {contributor.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Joined {formatMonth(contributor.joinedAt)}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="secondary">{plural(published, "paper")}</Badge>
          {pendingReview > 0 && (
            <Badge
              variant="outline"
              className="text-amber-700 dark:text-amber-400"
            >
              {pendingReview} pending review
            </Badge>
          )}
        </div>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
