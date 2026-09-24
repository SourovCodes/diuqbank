import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Noun for the count, e.g. "submission". */
  noun: string;
  hrefFor: (page: number) => string;
};

function PageButton({
  to,
  label,
  className,
  children,
}: {
  to: string | null;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return to ? (
    <Button variant="outline" size="icon-sm" asChild className={className}>
      <Link to={to} aria-label={label} preventScrollReset>
        {children}
      </Link>
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon-sm"
      disabled
      aria-label={label}
      className={className}
    >
      {children}
    </Button>
  );
}

/** Footer under a table: the row count, and first/previous/next/last page buttons. */
export function TablePagination({
  page,
  pageSize,
  total,
  noun,
  hrefFor,
}: TablePaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? `No ${noun}s`
          : `${from}–${to} of ${total} ${total === 1 ? noun : `${noun}s`}`}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden text-sm font-medium sm:block">
            Page {page} of {pages}
          </span>
          <PageButton
            to={page > 1 ? hrefFor(1) : null}
            label="First page"
            className="hidden lg:inline-flex"
          >
            <ChevronsLeft />
          </PageButton>
          <PageButton
            to={page > 1 ? hrefFor(page - 1) : null}
            label="Previous page"
          >
            <ChevronLeft />
          </PageButton>
          <PageButton
            to={page < pages ? hrefFor(page + 1) : null}
            label="Next page"
          >
            <ChevronRight />
          </PageButton>
          <PageButton
            to={page < pages ? hrefFor(pages) : null}
            label="Last page"
            className="hidden lg:inline-flex"
          >
            <ChevronsRight />
          </PageButton>
        </div>
      )}
    </div>
  );
}
