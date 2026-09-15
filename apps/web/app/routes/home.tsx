import { ArrowRight, Download, SlidersHorizontal, Users } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: "QuestionBank — Past exam question papers" },
  {
    name: "description",
    content:
      "Find previous exam question papers by department, course, semester and exam type. Free and community-contributed.",
  },
];

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Filter precisely",
    description:
      "Narrow down by department, course, semester and exam type to find exactly the paper you need.",
  },
  {
    icon: Download,
    title: "Open or download",
    description:
      "Every question paper is a PDF you can read on any device or save for later.",
  },
  {
    icon: Users,
    title: "Built by students",
    description:
      "Papers are contributed by the community and reviewed before they are published.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16 pb-8">
      <section className="space-y-6 pt-6 text-center sm:pt-16">
        <p className="mx-auto w-fit rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Free · Community-contributed
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Past question papers,{" "}
          <span className="text-primary">all in one place</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-pretty text-muted-foreground">
          Find previous exam questions by department, course, semester and exam
          type — then open or download the PDF.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/questions" className={buttonVariants({ size: "lg" })}>
            Browse questions
            <ArrowRight aria-hidden />
          </Link>
          <Link
            to="/contribute"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Contribute a paper
          </Link>
        </div>
      </section>

      <section aria-label="Features" className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-3 w-fit rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
