import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    Eye,
    FileText,
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
    const selectedIndex = submissions.findIndex((s) => s.id === selectedSubmission?.id);

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
            <Head title={question.title} />

            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/questions" className="hover:text-foreground transition-colors">
                        Questions
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{question.course?.name ?? 'Question'}</span>
                </nav>

                {/* Question Header */}
                <div className="mb-6 rounded-xl border bg-card p-6">
                    <h1 className="mb-2 text-xl font-semibold sm:text-2xl">
                        {question.course?.name ?? 'Unknown Course'}
                    </h1>
                    <div className="flex flex-wrap gap-2">
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
                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* PDF Viewer */}
                        <div className="min-w-0 flex-1">
                            <div className="overflow-hidden rounded-xl border bg-card">
                                {/* Viewer Header with Voting */}
                                <div className="flex items-center justify-between border-b px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {selectedSubmission?.user?.name ?? 'Anonymous'}
                                        </span>
                                        {selectedIndex === 0 && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Top Rated
                                            </span>
                                        )}
                                    </div>

                                    {/* Voting Controls */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleVote('upvote')}
                                            disabled={voting}
                                            className={cn(
                                                'inline-flex h-8 items-center justify-center rounded-md px-2 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
                                                selectedSubmission?.user_vote === 1 &&
                                                    'bg-primary/10 text-primary',
                                            )}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                        </button>
                                        <span
                                            className={cn(
                                                'min-w-8 text-center text-sm font-semibold',
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
                                            className={cn(
                                                'inline-flex h-8 items-center justify-center rounded-md px-2 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
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
                                        className="h-[600px] w-full border-0 lg:h-[700px]"
                                        title="PDF Viewer"
                                    />
                                ) : (
                                    <div className="flex h-[600px] items-center justify-center lg:h-[700px]">
                                        <div className="text-center">
                                            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">No PDF available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submissions Sidebar */}
                        <div className="w-full shrink-0 lg:w-80">
                            <div className="sticky top-6 rounded-xl border bg-card p-4">
                                <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                    {submissions.length} Submission{submissions.length !== 1 && 's'}
                                </h2>

                                <div className="space-y-2">
                                    {submissions.map((submission, index) => (
                                        <button
                                            key={submission.id}
                                            onClick={() => setSelectedId(submission.id)}
                                            className={cn(
                                                'w-full rounded-lg p-3 text-left transition-all',
                                                selectedId === submission.id
                                                    ? 'bg-primary/10 ring-1 ring-primary/30'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <div className="mb-1.5 flex items-center gap-2">
                                                {index === 0 && (
                                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                                        #1
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium">
                                                    {submission.user?.name ?? 'Anonymous'}
                                                </span>
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
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
