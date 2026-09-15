import { Upload } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import type { Route } from "./+types/contribute";

export const meta: Route.MetaFunction = () => [
  { title: "Contribute — QuestionBank" },
  { name: "robots", content: "noindex" },
];

// Placeholder until submission uploads are built.
export default function Contribute() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <div className="mx-auto w-fit rounded-full bg-primary/10 p-3 text-primary">
        <Upload className="size-6" aria-hidden />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Contribute a paper</h1>
      <p className="text-muted-foreground">
        Uploading question papers is coming soon. Thanks for wanting to help!
      </p>
      <Link to="/questions" className={buttonVariants({ variant: "outline" })}>
        Browse questions
      </Link>
    </div>
  );
}
