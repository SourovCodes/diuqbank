import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    FileText,
    Loader2,
    School,
    ThumbsDown,
    ThumbsUp,
    User,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { Question, SharedData } from '@/types';

interface Submission {
    id: number;
    user: {
        id: number;
        name: string;
    } | null;
    pdf_url: string | null;
    vote_score: number;
    user_vote: number | null;
    views: number;
    created_at: string;
}

interface QuestionShowProps {
    question: Question;
    submissions: Submission[];
}

export default function QuestionShow({ question, submissions }: QuestionShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedId, setSelectedId] = useState<number | null>(submissions[0]?.id ?? null);
    const [voting, setVoting] = useState(false);

    const selectedSubmission = submissions.find((s) => s.id === selectedId) ?? submissions[0] ?? null;
    const isTopRated = selectedSubmission?.id === submissions[0]?.id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleVote = (type: 'upvote' | 'downvote') => {
        if (!selectedSubmission) return;

        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        if (voting) return;
        setVoting(true);

        router.post(
            `/submissions/${selectedSubmission.id}/${type}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setVoting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={question.course?.name ?? 'Question'} />

            <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:py-6">
                {/* Course Name */}
                <h1 className="text-xl font-semibold sm:text-2xl">
                    {question.course?.name ?? 'Question'}
                </h1>

                {/* Question Meta */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm">
                        <School className="h-3.5 w-3.5" />
                        {question.department?.name ?? 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm">
                        {question.exam_type?.name ?? 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {question.semester?.name ?? 'Unknown'}
                    </span>
                </div>

                {submissions.length === 0 ? (
                    /* Empty State */
                    <div className="rounded-xl border bg-card p-12 text-center">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mb-2 text-lg font-medium">No submissions yet</h3>
                        <p className="text-muted-foreground">
                            Be the first to submit a solution for this question.
                        </p>
                    </div>
                ) : (
                    /* Main Content */
                    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                        {/* PDF Viewer */}
                        <div className="order-2 min-w-0 flex-1 lg:order-1">
                            <div className="overflow-hidden rounded-xl border bg-card">
                                {/* Viewer Header with Voting */}
                                <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
                                    <div className="flex min-w-0 items-center gap-2 text-sm">
                                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate font-medium">
                                            {selectedSubmission?.user?.name ?? 'Anonymous'}
                                        </span>
                                        {isTopRated && (
                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Top Rated
                                            </span>
                                        )}
                                    </div>

                                    {/* Voting Controls */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleVote('upvote')}
                                            disabled={voting}
                                            aria-label="Upvote submission"
                                            className={cn(
                                                'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
                                                selectedSubmission?.user_vote === 1 &&
                                                    'bg-primary/10 text-primary',
                                            )}
                                        >
                                            {voting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ThumbsUp className="h-4 w-4" />
                                            )}
                                        </button>
                                        <span
                                            className={cn(
                                                'min-w-6 text-center text-sm font-semibold',
                                                (selectedSubmission?.vote_score ?? 0) > 0 && 'text-primary',
                                                (selectedSubmission?.vote_score ?? 0) < 0 && 'text-destructive',
                                            )}
                                        >
                                            {selectedSubmission?.vote_score ?? 0}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleVote('downvote')}
                                            disabled={voting}
                                            aria-label="Downvote submission"
                                            className={cn(
                                                'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
                                                selectedSubmission?.user_vote === -1 &&
                                                    'bg-destructive/10 text-destructive',
                                            )}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* PDF Frame */}
                                {selectedSubmission?.pdf_url ? (
                                    <iframe
                                        key={selectedSubmission.id}
                                        src={selectedSubmission.pdf_url}
                                        className="h-[calc(100vh-280px)] min-h-[400px] w-full border-0 sm:min-h-[500px] lg:h-[calc(100vh-200px)]"
                                        title="PDF Viewer"
                                    />
                                ) : (
                                    <div className="flex h-[400px] items-center justify-center sm:h-[500px]">
                                        <div className="text-center">
                                            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">No PDF available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submissions Sidebar */}
                        <div className="order-1 w-full shrink-0 lg:order-2 lg:w-72">
                            <div className="rounded-xl border bg-card p-3 sm:p-4 lg:sticky lg:top-4">
                                <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground sm:mb-4">
                                    {submissions.length} Submission{submissions.length !== 1 && 's'}
                                </h2>

                                <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-2 lg:overflow-x-visible lg:pb-0">
                                    {submissions.map((submission, index) => (
                                        <button
                                            key={submission.id}
                                            onClick={() => setSelectedId(submission.id)}
                                            className={cn(
                                                'shrink-0 rounded-lg p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-3 lg:w-full',
                                                selectedId === submission.id
                                                    ? 'bg-primary/10 ring-1 ring-primary/30'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <div className="mb-1 flex items-center gap-2">
                                                {index === 0 && (
                                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                                        #1
                                                    </span>
                                                )}
                                                <span className="truncate text-sm font-medium">
                                                    {submission.user?.name ?? 'Anonymous'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:gap-3">
                                                <span className="inline-flex items-center gap-1">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {submission.vote_score}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {submission.views}
                                                </span>
                                                <span className="hidden sm:inline">
                                                    {formatDate(submission.created_at)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
