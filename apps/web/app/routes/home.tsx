import {
  ArrowRight,
  Download,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    title: "Read anywhere",
    description:
      "View papers right in the browser on any device, or download the PDF for later.",
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
    <div className="space-y-16 py-4 sm:py-12">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          <Sparkles />
          Free · Community-contributed
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Past question papers, all in one place
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Find previous exam questions by department, course, semester and exam
          type, then read them right in your browser.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/questions">
              Browse questions
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contribute">Contribute a paper</Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Features"
        className="grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-background shadow-xs">
                <Icon className="size-4" aria-hidden />
              </div>
              <CardTitle>
                <h2>{title}</h2>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
