import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, Eye, FileText, Plus, School, ThumbsUp } from 'lucide-react';

import { CustomPagination } from '@/components/custom-pagination';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { formatDate } from '@/lib/utils';
import { create, edit } from '@/routes/dashboard/submissions';
import { show as showQuestion } from '@/routes/questions';
import type { SubmissionsIndexData } from '@/types';

interface Props {
    submissions: SubmissionsIndexData;
}

export default function MySubmissions({ submissions }: Props) {
    return (
        <DashboardLayout breadcrumbs={[{ label: 'My Submissions' }]}>
            <Head title="My Submissions" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
                        <p className="text-muted-foreground">Manage your submitted question papers.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Submission
                        </Link>
                    </Button>
                </div>

                {submissions.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No submissions yet"
                        description="You haven't submitted any question papers yet. Start by uploading your first one!"
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {submissions.data.map((submission) => (
                                <Card key={submission.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="line-clamp-1 text-base">
                                                {submission.question.course.name}
                                            </CardTitle>
                                            <StatusBadge status={submission.question.status} label={submission.question.status_label} />
                                        </div>
                                        <CardDescription className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                                                <School className="h-3 w-3" />
                                                {submission.question.department.short_name}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                                                {submission.question.exam_type.name}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                                                <Calendar className="h-3 w-3" />
                                                {submission.question.semester.name}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                                        <div className="mt-4 flex gap-2">
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <Link href={`${showQuestion.url(submission.question.id)}#submission=${submission.id}`}>
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <Link href={edit.url(submission.id)}>
                                                    <Edit className="mr-2 h-3.5 w-3.5" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {submissions.last_page > 1 && (
                            <CustomPagination
                                currentPage={submissions.current_page}
                                totalPages={submissions.last_page}
                            />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

MySubmissions.layout = null;
