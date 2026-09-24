import type { Question } from "@qb/shared";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatCount } from "~/lib/format";
import { plural } from "~/lib/submissions";

/** Questions as a table; each row opens the question. */
export function QuestionTable({ questions }: { questions: Question[] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden md:table-cell">Semester</TableHead>
            <TableHead className="hidden lg:table-cell">Exam type</TableHead>
            <TableHead>Papers</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Views
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            const { published, pendingReview } = question.submissionCounts;
            const href = `/questions/${question.id}`;
            return (
              <TableRow
                key={question.id}
                className="cursor-pointer"
                onClick={() => navigate(href)}
              >
                <TableCell className="w-full max-w-0">
                  <Link
                    to={href}
                    prefetch="intent"
                    className="block truncate font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {question.course.name}
                  </Link>
                  {/* On narrow screens the other columns fold into this line. */}
                  <p className="truncate text-xs text-muted-foreground md:hidden">
                    {question.department.shortName} · {question.semester.name} ·{" "}
                    {question.examType.name}
                  </p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {question.department.shortName}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {question.semester.name}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {question.examType.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Badge variant={published > 0 ? "secondary" : "outline"}>
                      {published > 0 ? plural(published, "paper") : "None yet"}
                    </Badge>
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
                  </div>
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" aria-hidden />
                    {formatCount(question.viewCount)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
