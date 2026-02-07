import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileText,
    Loader2,
    Maximize2,
    Minimize2,
    School,
    ThumbsDown,
    ThumbsUp,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { show as showContributor } from '@/routes/contributors';
import { downvote, upvote, view as trackView } from '@/routes/submissions';
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

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function QuestionShow({ question, submissions }: QuestionShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedId, setSelectedId] = useState<number | null>(() => getInitialSubmissionId(submissions));
    const [voting, setVoting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewCounts, setViewCounts] = useState<Record<number, number>>(() => {
        // Initialize view counts from submissions
        return submissions.reduce(
            (acc, s) => {
                acc[s.id] = s.views;
                return acc;
            },
            {} as Record<number, number>,
        );
    });
    const trackedViewsRef = useRef<Set<number>>(new Set());
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

    // Track view when a submission is selected
    useEffect(() => {
        if (selectedId === null) return;
        if (trackedViewsRef.current.has(selectedId)) return;

        // Delay view tracking by 5 seconds
        const timer = setTimeout(() => {
            // Mark as tracked immediately to prevent duplicate calls
            trackedViewsRef.current.add(selectedId);

            // Send view tracking request
            fetch(trackView.url(selectedId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data: { success: boolean; views: number; already_viewed: boolean }) => {
                    if (data.success) {
                        setViewCounts((prev) => ({ ...prev, [selectedId]: data.views }));
                    }
                })
                .catch(() => {
                    // Silently fail - view tracking is not critical
                });
        }, 5000);

        return () => clearTimeout(timer);
    }, [selectedId]);

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
                    <EmptyState icon={FileText} title="No submissions yet" description="Be the first to submit a solution for this question." />
                ) : (
                    <>
                        {submissions.length > 1 && (
                            <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground sm:mb-4">
                                <ChevronLeft className="h-4 w-4 shrink-0 text-primary" />
                                <ChevronRight className="-ml-3 h-4 w-4 shrink-0 text-primary" />
                                <span>
                                    <span className="font-medium text-foreground">{submissions.length} submissions</span>
                                    <span> — swipe or tap to switch</span>
                                </span>
                            </div>
                        )}

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="min-w-0 space-y-3">
                                <div ref={containerRef} className="overflow-hidden rounded-xl border bg-card">
                                    <div className="flex items-center justify-between border-b bg-muted/30">
                                        <div className="flex min-w-0 flex-1 overflow-x-auto">
                                            {submissions.map((submission, index) => (
                                                <button
                                                    key={submission.id}
                                                    onClick={() => handleSelectSubmission(submission.id)}
                                                    className={cn(
                                                        'relative flex shrink-0 cursor-pointer items-center gap-2 border-r px-4 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset',
                                                        selectedId === submission.id
                                                            ? 'bg-background font-medium text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                    )}
                                                >
                                                    {selectedId === submission.id && (
                                                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                                                    )}
                                                    <span
                                                        className={cn(
                                                            'flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-semibold',
                                                            index === 0
                                                                ? 'bg-primary/10 text-primary'
                                                                : selectedId === submission.id
                                                                  ? 'bg-muted text-foreground'
                                                                  : 'bg-muted/50 text-muted-foreground',
                                                        )}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                    {submission.section && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                            {submission.section}
                                                        </span>
                                                    )}
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
                                        <div className="flex shrink-0 items-center gap-1 px-3">
                                            <button
                                                type="button"
                                                onClick={toggleFullscreen}
                                                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                            </button>
                                            {selectedSubmission?.pdf_url && (
                                                <a
                                                    href={selectedSubmission.pdf_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Download PDF"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-b bg-background px-3 py-2">
                                        {selectedSubmission?.user ? (
                                            <Link
                                                href={showContributor.url({ user: selectedSubmission.user.username })}
                                                className="-ml-1 hidden items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/50 sm:flex"
                                            >
                                                <Avatar size="sm">
                                                    <AvatarImage src={selectedSubmission.user.avatar_url} alt={selectedSubmission.user.name} />
                                                    <AvatarFallback>{getInitials(selectedSubmission.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="max-w-[220px] truncate text-sm font-medium text-foreground">
                                                        {selectedSubmission.user.name}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Eye className="h-3 w-3" />
                                                        <span className="tabular-nums">
                                                            {viewCounts[selectedSubmission.id] ?? selectedSubmission.views}
                                                        </span>
                                                        {selectedSubmission.created_at && (
                                                            <span className="hidden sm:inline">• {formatDate(selectedSubmission.created_at)}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="hidden items-center gap-2.5 sm:flex">
                                                <Avatar size="sm">
                                                    <AvatarFallback>
                                                        <User className="h-3 w-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground">Anonymous</p>
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Eye className="h-3 w-3" />
                                                        <span className="tabular-nums">{viewCounts[selectedSubmission?.id ?? 0] ?? 0}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1 lg:hidden">
                                            <button
                                                type="button"
                                                onClick={goToPrevious}
                                                disabled={selectedIndex === 0}
                                                aria-label="Previous submission"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-muted disabled:pointer-events-none disabled:opacity-30"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary tabular-nums">
                                                {selectedIndex + 1}/{submissions.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={goToNext}
                                                disabled={selectedIndex === submissions.length - 1}
                                                aria-label="Next submission"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-muted disabled:pointer-events-none disabled:opacity-30"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {selectedSubmission?.pdf_url ? (
                                        <object
                                            key={selectedSubmission.id}
                                            data={selectedSubmission.pdf_url}
                                            type="application/pdf"
                                            className={cn('w-full', isFullscreen ? 'h-full min-h-0' : 'h-[calc(100vh-220px)] min-h-125')}
                                            style={isFullscreen ? { height: '100%', minHeight: 0 } : {}}
                                            title={question.course?.name ?? 'PDF Viewer'}
                                        >
                                            <iframe
                                                src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(selectedSubmission.pdf_url)}`}
                                                className={cn('w-full border-0', isFullscreen ? 'h-full min-h-0' : 'h-[calc(100vh-220px)] min-h-125')}
                                                style={isFullscreen ? { height: '100%', minHeight: 0 } : {}}
                                                title={question.course?.name ?? 'PDF Viewer'}
                                            />
                                        </object>
                                    ) : (
                                        <div className="flex h-125 items-center justify-center">
                                            <div className="text-center">
                                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                                <p className="text-muted-foreground">No PDF available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <aside className="order-2 space-y-4 lg:order-none lg:sticky lg:top-4">
                                <div className="rounded-xl border bg-card p-4">
                                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Uploaded by</h3>
                                    {selectedSubmission?.user ? (
                                        <Link
                                            href={showContributor.url({ user: selectedSubmission.user.username })}
                                            className="-mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <Avatar>
                                                <AvatarImage src={selectedSubmission.user.avatar_url} alt={selectedSubmission.user.name} />
                                                <AvatarFallback>{getInitials(selectedSubmission.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="max-w-[200px] truncate font-medium text-foreground">
                                                    {selectedSubmission.user.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">View profile →</p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    <User className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">Anonymous</p>
                                                <p className="text-sm text-muted-foreground">Unknown contributor</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border bg-card p-4">
                                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Rate this submission
                                    </h3>
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleVote('upvote')}
                                            disabled={voting}
                                            className={cn(
                                                'flex flex-col items-center gap-1 rounded-lg px-4 py-3 transition-colors hover:bg-green-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-green-900/20',
                                                selectedSubmission?.user_vote === 1 && 'bg-green-100 dark:bg-green-900/30',
                                            )}
                                        >
                                            {voting ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                            ) : (
                                                <ThumbsUp
                                                    className={cn(
                                                        'h-6 w-6',
                                                        selectedSubmission?.user_vote === 1 ? 'text-green-600' : 'text-muted-foreground',
                                                    )}
                                                />
                                            )}
                                            <span className="text-xs text-muted-foreground">Upvote</span>
                                        </button>
                                        <div className="text-center">
                                            <p
                                                className={cn(
                                                    'text-3xl font-bold tabular-nums',
                                                    (selectedSubmission?.vote_score ?? 0) > 0 && 'text-green-600 dark:text-green-400',
                                                    (selectedSubmission?.vote_score ?? 0) < 0 && 'text-red-600 dark:text-red-400',
                                                    (selectedSubmission?.vote_score ?? 0) === 0 && 'text-muted-foreground',
                                                )}
                                            >
                                                {selectedSubmission?.vote_score ?? 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground">votes</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleVote('downvote')}
                                            disabled={voting}
                                            className={cn(
                                                'flex flex-col items-center gap-1 rounded-lg px-4 py-3 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-900/20',
                                                selectedSubmission?.user_vote === -1 && 'bg-red-100 dark:bg-red-900/30',
                                            )}
                                        >
                                            <ThumbsDown
                                                className={cn(
                                                    'h-6 w-6',
                                                    selectedSubmission?.user_vote === -1 ? 'text-red-600' : 'text-muted-foreground',
                                                )}
                                            />
                                            <span className="text-xs text-muted-foreground">Downvote</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-card p-4">
                                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Submission Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Views</span>
                                            <span className="ml-auto font-medium tabular-nums">
                                                {viewCounts[selectedSubmission?.id ?? 0] ?? selectedSubmission?.views ?? 0}
                                            </span>
                                        </div>
                                        {selectedSubmission?.section && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <School className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Section</span>
                                                <span className="ml-auto font-medium">{selectedSubmission.section}</span>
                                            </div>
                                        )}
                                        {selectedSubmission?.created_at && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Uploaded</span>
                                                <span className="ml-auto font-medium">{formatDate(selectedSubmission.created_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
