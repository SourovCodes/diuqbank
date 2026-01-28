import { Head, Link } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Eye, FileText, Plus, School, ThumbsUp, XCircle } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { formatDate } from '@/lib/utils';
import { create, index as submissionsIndex } from '@/routes/dashboard/submissions';
import { show as showQuestion } from '@/routes/questions';
import type { SubmissionItem } from '@/types';

interface DashboardStats {
    total_submissions: number;
    published: number;
    pending_review: number;
    rejected: number;
}

interface Props {
    stats: DashboardStats;
    recentSubmissions: SubmissionItem[];
}

export default function Dashboard({ stats, recentSubmissions }: Props) {
    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back! Here's an overview of your contributions.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Submission
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_submissions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.published}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_review}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Submissions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Submissions</CardTitle>
                                <CardDescription>Your latest question paper submissions.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={submissionsIndex.url()}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentSubmissions.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No submissions yet"
                                description="Start contributing by uploading your first question paper!"
                            />
                        ) : (
                            <div className="space-y-4">
                                {recentSubmissions.map((submission) => (
                                    <Link
                                        key={submission.id}
                                        href={showQuestion({ question: submission.question.id })}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{submission.question.course.name}</span>
                                                <StatusBadge status={submission.question.status} label={submission.question.status_label} />
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <School className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                    {submission.question.department.short_name}
                                                </span>
                                                <span className="text-amber-600 dark:text-amber-400">{submission.question.exam_type.name}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                                    {submission.question.semester.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                {submission.vote_score}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                                {submission.views}
                                            </span>
                                            <span className="hidden sm:inline">{formatDate(submission.created_at)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

Dashboard.layout = null;
