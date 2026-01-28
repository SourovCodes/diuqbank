import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Loader2,
    School,
    ThumbsDown,
    ThumbsUp,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { cn, formatDate } from '@/lib/utils';
import { login } from '@/routes';
import { upvote, downvote } from '@/routes/submissions';
import type { SharedData } from '@/types';
import type { Question, Submission } from '@/types/question';

interface QuestionShowProps {
    question: Question;
    submissions: Submission[];
}

function getInitialSubmissionId(submissions: Submission[]): number | null {
    if (submissions.length === 0) return null;

    const hash = window.location.hash;
    const match = hash.match(/^#submission=(\d+)$/);

    if (match) {
        const submissionId = parseInt(match[1], 10);
        const isValid = submissions.some((s) => s.id === submissionId);
        if (isValid) return submissionId;
    }

    return submissions[0]?.id ?? null;
}

export default function QuestionShow({ question, submissions }: QuestionShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedId, setSelectedId] = useState<number | null>(() => getInitialSubmissionId(submissions));
    const [voting, setVoting] = useState(false);

    const updateUrlWithSubmission = useCallback(
        (submissionId: number | null) => {
            if (submissionId === null) return;

            const isFirstSubmission = submissions[0]?.id === submissionId;

            if (isFirstSubmission) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            } else {
                history.replaceState(null, '', `#submission=${submissionId}`);
            }
        },
        [submissions],
    );

    const handleSelectSubmission = useCallback(
        (submissionId: number) => {
            setSelectedId(submissionId);
            updateUrlWithSubmission(submissionId);
        },
        [updateUrlWithSubmission],
    );

    // Sync URL when submissions change (e.g., after voting reorder)
    useEffect(() => {
        if (selectedId !== null) {
            const isValid = submissions.some((s) => s.id === selectedId);
            if (!isValid && submissions.length > 0) {
                handleSelectSubmission(submissions[0].id);
            }
        }
    }, [submissions, selectedId, handleSelectSubmission]);

    const selectedSubmission = submissions.find((s) => s.id === selectedId) ?? submissions[0] ?? null;
    const selectedIndex = submissions.findIndex((s) => s.id === selectedId);
    const isTopRated = selectedSubmission?.id === submissions[0]?.id;
    const hasMultipleSubmissions = submissions.length > 1;

    const handleVote = (type: 'upvote' | 'downvote') => {
        if (!selectedSubmission) return;

        if (!auth?.user) {
            router.visit(login.url());
            return;
        }

        if (voting) return;
        setVoting(true);

        const voteRoute = type === 'upvote' ? upvote : downvote;
        router.post(
            voteRoute.url(selectedSubmission.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setVoting(false);
                },
            },
        );
    };

    const goToPrevious = () => {
        if (selectedIndex > 0) {
            handleSelectSubmission(submissions[selectedIndex - 1].id);
        }
    };

    const goToNext = () => {
        if (selectedIndex < submissions.length - 1) {
            handleSelectSubmission(submissions[selectedIndex + 1].id);
        }
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
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <School className="h-3.5 w-3.5" />
                        {question.department?.name ?? 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {question.exam_type?.name ?? 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2.5 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <Calendar className="h-3.5 w-3.5" />
                        {question.semester?.name ?? 'Unknown'}
                    </span>
                </div>

                {submissions.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No submissions yet"
                        description="Be the first to submit a solution for this question."
                    />
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
                                        {selectedSubmission?.section && (
                                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                Section {selectedSubmission.section}
                                            </span>
                                        )}
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
                                        className="h-[calc(100vh-280px)] min-h-100 w-full border-0 sm:min-h-125 lg:h-[calc(100vh-200px)]"
                                        title="PDF Viewer"
                                    />
                                ) : (
                                    <div className="flex h-100 items-center justify-center sm:h-125">
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
                                {/* Mobile Navigation */}
                                {hasMultipleSubmissions && (
                                    <div className="flex items-center justify-between lg:hidden">
                                        <button
                                            type="button"
                                            onClick={goToPrevious}
                                            disabled={selectedIndex === 0}
                                            aria-label="Previous submission"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="text-center">
                                            <span className="text-sm font-medium">
                                                {selectedIndex + 1} of {submissions.length}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedSubmission?.user?.name ?? 'Anonymous'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={goToNext}
                                            disabled={selectedIndex === submissions.length - 1}
                                            aria-label="Next submission"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Single submission on mobile */}
                                {!hasMultipleSubmissions && (
                                    <p className="text-center text-sm text-muted-foreground lg:hidden">
                                        1 submission by {selectedSubmission?.user?.name ?? 'Anonymous'}
                                    </p>
                                )}

                                {/* Desktop List */}
                                <div className="hidden lg:block">
                                    <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                        {submissions.length} Submission{submissions.length !== 1 && 's'}
                                    </h2>

                                    <div className="space-y-2">
                                        {submissions.map((submission, index) => (
                                            <button
                                                key={submission.id}
                                                onClick={() => handleSelectSubmission(submission.id)}
                                                className={cn(
                                                    'w-full rounded-lg p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
                                                    {submission.section && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                            {submission.section}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        {submission.vote_score}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {submission.views}
                                                    </span>
                                                    <span>{formatDate(submission.created_at)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vote CTA */}
                                <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4">
                                    <ThumbsUp className="mr-1 inline h-3 w-3" />
                                    Upvote quality submissions · Downvote incorrect ones
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
