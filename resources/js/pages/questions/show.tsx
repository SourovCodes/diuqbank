import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Loader2,
    Maximize2,
    Minimize2,
    School,
    ThumbsDown,
    ThumbsUp,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { downvote, upvote } from '@/routes/submissions';
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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

            <div className="container mx-auto px-4 py-4 sm:py-6">
                {/* Header Section */}
                <div className="mb-4 space-y-3 sm:mb-6">
                    <h1 className="text-xl font-semibold sm:text-2xl">{question.course?.name ?? 'Question'}</h1>

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
                </div>

                {submissions.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No submissions yet"
                        description="Be the first to submit a solution for this question."
                    />
                ) : (
                    <div ref={containerRef} className="overflow-hidden rounded-xl border bg-card">
                        {/* Submission Tabs */}
                        <div className="flex items-center justify-between border-b bg-muted/30">
                            {/* Tab Navigation */}
                            <div className="flex items-center">
                                {/* Mobile: Prev/Next */}
                                <div className="flex items-center sm:hidden">
                                    <button
                                        type="button"
                                        onClick={goToPrevious}
                                        disabled={selectedIndex === 0}
                                        aria-label="Previous submission"
                                        className="inline-flex h-10 w-10 items-center justify-center border-r text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="flex items-center gap-1.5 px-3 text-sm font-medium">
                                        #{selectedSubmission?.id}
                                        {selectedSubmission?.section && (
                                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                {selectedSubmission.section}
                                            </span>
                                        )}
                                        <span className="text-muted-foreground">
                                            ({selectedIndex + 1}/{submissions.length})
                                        </span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={goToNext}
                                        disabled={selectedIndex === submissions.length - 1}
                                        aria-label="Next submission"
                                        className="inline-flex h-10 w-10 items-center justify-center border-l text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Desktop: Scrollable Tabs */}
                                <div className="hidden overflow-x-auto sm:flex">
                                    {submissions.map((submission, index) => (
                                        <button
                                            key={submission.id}
                                            onClick={() => handleSelectSubmission(submission.id)}
                                            className={cn(
                                                'relative flex shrink-0 items-center gap-2 border-r px-4 py-2.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                                                selectedId === submission.id
                                                    ? 'bg-background text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {/* Active indicator */}
                                            {selectedId === submission.id && (
                                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                                            )}

                                            {/* Rank badge for #1 */}
                                            {index === 0 ? (
                                                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                                                    1
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">#{submission.id}</span>
                                            )}

                                            {/* Section badge */}
                                            {submission.section && (
                                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                    {submission.section}
                                                </span>
                                            )}

                                            {/* Vote score */}
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1 text-xs tabular-nums',
                                                    submission.vote_score > 0 && 'text-green-600 dark:text-green-400',
                                                    submission.vote_score < 0 && 'text-red-600 dark:text-red-400',
                                                    submission.vote_score === 0 && 'text-muted-foreground',
                                                )}
                                            >
                                                <ThumbsUp className="h-3 w-3" />
                                                {submission.vote_score}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1 px-2 sm:px-3">
                                {/* Fullscreen Button */}
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </button>

                                <div className="mx-1 h-5 w-px bg-border" />

                                {/* Voting */}
                                <button
                                    type="button"
                                    onClick={() => handleVote('upvote')}
                                    disabled={voting}
                                    aria-label="Upvote submission"
                                    className={cn(
                                        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-green-100 hover:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-green-900/30 dark:hover:text-green-400',
                                        selectedSubmission?.user_vote === 1 &&
                                            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                                    )}
                                >
                                    {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                                </button>
                                <span
                                    className={cn(
                                        'min-w-6 text-center text-sm font-semibold tabular-nums',
                                        (selectedSubmission?.vote_score ?? 0) > 0 &&
                                            'text-green-600 dark:text-green-400',
                                        (selectedSubmission?.vote_score ?? 0) < 0 && 'text-red-600 dark:text-red-400',
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
                                        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400',
                                        selectedSubmission?.user_vote === -1 &&
                                            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
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
                                className="h-[calc(100vh-260px)] min-h-100 w-full border-0 sm:min-h-125 lg:h-[calc(100vh-200px)]"
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
                )}
            </div>
        </>
    );
}
