import type { Submission } from "@qb/shared";
import { ChevronRight, UserRound } from "lucide-react";
import { Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate } from "~/lib/dates";
import { formatBytes } from "~/lib/format";

/** Who uploaded the currently selected submission. */
export function UploaderCard({ submission }: { submission: Submission }) {
  const { uploader } = submission;
  const details = `Added ${formatDate(submission.createdAt)} · ${formatBytes(submission.fileSize)}`;

  return (
    <Card className="gap-3 pb-2">
      <CardHeader>
        <CardTitle>
          <h2>Uploaded by</h2>
        </CardTitle>
      </CardHeader>
      <div className="px-2">
        {uploader ? (
          <Link
            to={`/contributors/${encodeURIComponent(uploader.id)}`}
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent"
          >
            <ContributorAvatar name={uploader.name} image={uploader.image} />
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">
                {uploader.name}
              </span>
              <span className="text-xs text-muted-foreground">{details}</span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-5" aria-hidden />
            </span>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="text-sm font-medium">Unknown contributor</span>
              <span className="text-xs text-muted-foreground">{details}</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
