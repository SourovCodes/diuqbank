import type { Question } from "@qb/shared";
import { CalendarDays, Eye, FileText } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatCount } from "~/lib/format";
import { plural } from "~/lib/submissions";

/** Card-grid layout shared by the public lists. */
export const CARD_GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

/** Hover and focus styles for a card that is one big link. */
export const LINK_CARD =
  "relative gap-4 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50";

/** Makes a card's title link cover the whole card. */
export const STRETCHED_LINK =
  "after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none";

function QuestionCard({ question }: { question: Question }) {
  const { published, pendingReview } = question.submissionCounts;

  return (
    <Card className={LINK_CARD}>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" title={question.department.name}>
            {question.department.shortName}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {question.examType.name}
          </Badge>
        </div>
        <CardTitle className="text-base leading-snug">
          <Link
            to={`/questions/${question.id}`}
            prefetch="intent"
            className={STRETCHED_LINK}
          >
            {question.course.name}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          {question.semester.name}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto justify-between gap-3 border-t pt-4 text-sm text-muted-foreground [.border-t]:pt-4">
        <span className="flex items-center gap-1.5">
          <FileText className="size-4" aria-hidden />
          <span className={published > 0 ? "font-medium text-foreground" : ""}>
            {published > 0 ? plural(published, "paper") : "No papers yet"}
          </span>
          {pendingReview > 0 && (
            <Badge
              variant="outline"
              className="text-muted-foreground"
              title={`${pendingReview} waiting for review`}
            >
              +{pendingReview}
              <span className="sr-only"> pending review</span>
            </Badge>
          )}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Eye className="size-4" aria-hidden />
          {formatCount(question.viewCount)}
          <span className="sr-only"> views</span>
        </span>
      </CardFooter>
    </Card>
  );
}

/** Questions as a grid of cards; each card opens the question. */
export function QuestionCards({ questions }: { questions: Question[] }) {
  return (
    <ul aria-label="Questions" className={CARD_GRID}>
      {questions.map((question) => (
        <li key={question.id} className="grid">
          <QuestionCard question={question} />
        </li>
      ))}
    </ul>
  );
}
