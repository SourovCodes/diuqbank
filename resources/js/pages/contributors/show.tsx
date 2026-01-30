import { Head } from '@inertiajs/react';
import { Eye, FileText, ThumbsUp } from 'lucide-react';

import { CustomPagination } from '@/components/custom-pagination';
import { EmptyState } from '@/components/empty-state';
import { SubmissionCard, type SubmissionWithQuestion } from '@/components/submission-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import type { Contributor, PaginatedData } from '@/types';

interface ContributorShowProps {
    contributor: Contributor;
    submissions: PaginatedData<SubmissionWithQuestion>;
}

export default function ContributorShow({ contributor, submissions }: ContributorShowProps) {
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
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    {contributor.submissions_count}
                                </div>
                                <p className="text-sm text-muted-foreground">Submissions</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                    <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    {contributor.total_votes}
                                </div>
                                <p className="text-sm text-muted-foreground">Votes</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                    <Eye className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
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
                        <EmptyState
                            icon={FileText}
                            title="No submissions yet"
                            description="This contributor hasn't submitted any questions yet."
                        />
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
