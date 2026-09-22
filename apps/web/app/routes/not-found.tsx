import { FileQuestion } from "lucide-react";
import { data, Link } from "react-router";
import { EmptyState } from "~/components/empty-state";
import { buttonVariants } from "~/components/ui/button";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
  { title: "Page not found — QuestionBank" },
  { name: "robots", content: "noindex" },
];

// A matched catch-all rather than root's ErrorBoundary, so the page can set its
// own title and so the dev server collects root's CSS (it derives the critical
// stylesheet from the matched routes, and an unmatched path matches none).
export function loader() {
  return data(null, { status: 404 });
}

export default function NotFound() {
  return (
    <EmptyState
      className="py-16"
      icon={FileQuestion}
      title="Page not found"
      description="We couldn't find what you were looking for."
      action={
        <Link
          to="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to home
        </Link>
      }
    />
  );
}
