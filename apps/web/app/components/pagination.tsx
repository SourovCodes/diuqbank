import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
};

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const linkClass = buttonVariants({ variant: "outline", size: "sm" });
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-3 pt-2"
    >
      {page > 1 && (
        <Link to={hrefFor(page - 1)} className={linkClass}>
          Previous
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link to={hrefFor(page + 1)} className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
}
