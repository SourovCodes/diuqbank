import { Upload } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { buttonVariants } from "~/components/ui/button";
import type { Route } from "./+types/contribute";

export const meta: Route.MetaFunction = () => [
  { title: "Contribute — QuestionBank" },
  { name: "robots", content: "noindex" },
];

// Placeholder until submission uploads are built.
export default function Contribute() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Contribute a paper"
        description="Share question papers with other students. Every submission is reviewed before it is published."
      />
      <EmptyState
        icon={Upload}
        title="Uploads are coming soon"
        description="Thanks for wanting to help! You’ll be able to upload question paper PDFs here shortly."
        action={
          <Link
            to="/questions"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Browse questions
          </Link>
        }
      />
    </div>
  );
}
