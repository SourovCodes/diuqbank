import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Eye, School, ThumbsUp } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { show as showQuestion } from '@/routes/questions';
import type { Course, Department, ExamType, Semester, Submission } from '@/types';

export interface SubmissionWithQuestion extends Submission {
    question?: {
        id: number;
        department?: Department;
        course?: Course;
        semester?: Semester;
        exam_type?: ExamType;
    };
}

interface SubmissionCardProps {
    submission: SubmissionWithQuestion;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
    const question = submission.question;

    if (!question) {
        return null;
    }

    return (
        <Link href={showQuestion.url(question.id)} className="group block">
            <div className="relative h-full overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <h3 className="mb-2 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {question.course?.name ?? 'Unknown Course'}
                </h3>

                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <School className="h-3 w-3" />
                        {question.department?.short_name ?? 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {question.exam_type?.name ?? 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {question.semester?.name ?? 'Unknown'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {submission.vote_score}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {submission.views}
                        </span>
                    </div>
                    <span>{formatDate(submission.created_at)}</span>
                </div>

                <div className="absolute right-4 bottom-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-3 w-3 text-primary" />
                </div>
            </div>
        </Link>
    );
}
