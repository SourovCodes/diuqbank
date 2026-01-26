import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Clock, School } from 'lucide-react';

import type { Question } from '@/types';

interface QuestionCardProps {
    question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Link href={`/questions/${question.id}`} className="group block">
            <div className="relative h-full overflow-hidden rounded-xl border bg-card py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <div className="relative z-10 flex h-full flex-col px-4 py-0">
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 flex-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                            {question.course?.name ?? 'Unknown Course'}
                        </h3>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                            <School className="h-3.5 w-3.5" />
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

                    <div className="mt-auto mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                        <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            <span>{formatDate(question.created_at)}</span>
                        </div>
                    </div>

                    <div className="absolute right-4 bottom-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
