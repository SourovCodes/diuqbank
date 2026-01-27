import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Eye, FileText, School, ThumbsUp } from 'lucide-react';

import { CustomPagination } from '@/components/custom-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Contributor, Course, Department, ExamType, PaginatedData, Semester, Submission } from '@/types';

interface SubmissionWithQuestion extends Submission {
    question?: {
        id: number;
        department?: Department;
        course?: Course;
        semester?: Semester;
        exam_type?: ExamType;
    };
}

interface ContributorShowProps {
    contributor: Contributor;
    submissions: PaginatedData<SubmissionWithQuestion>;
}

export default function ContributorShow({ contributor, submissions }: ContributorShowProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title={contributor.name} />

            <div className="container mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <Avatar className="h-24 w-24 ring-4 ring-background">
                            <AvatarImage src={contributor.avatar_url} alt={contributor.name} />
                            <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                                {getInitials(contributor.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{contributor.name}</h1>
                            <p className="text-muted-foreground">@{contributor.username}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Member since {formatDate(contributor.created_at)}
                            </p>
                        </div>

                        <div className="flex gap-6 sm:gap-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    {contributor.submissions_count}
                                </div>
                                <p className="text-sm text-muted-foreground">Submissions</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                    <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                                    {contributor.total_votes}
                                </div>
                                <p className="text-sm text-muted-foreground">Votes</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                    {contributor.total_views}
                                </div>
                                <p className="text-sm text-muted-foreground">Views</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Submissions</h2>

                    {submissions.data.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
                            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                            <h3 className="mb-2 text-lg font-medium">No submissions yet</h3>
                            <p className="text-muted-foreground">
                                This contributor hasn't submitted any questions yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {submissions.data.map((submission) => (
                                <SubmissionCard key={submission.id} submission={submission} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {submissions.data.length > 0 && submissions.meta.last_page > 1 && (
                        <div className="mt-8">
                            <CustomPagination
                                currentPage={submissions.meta.current_page}
                                totalPages={submissions.meta.last_page}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface SubmissionCardProps {
    submission: SubmissionWithQuestion;
}

function SubmissionCard({ submission }: SubmissionCardProps) {
    const question = submission.question;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!question) {
        return null;
    }

    return (
        <Link href={`/questions/${question.id}`} className="group block">
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
