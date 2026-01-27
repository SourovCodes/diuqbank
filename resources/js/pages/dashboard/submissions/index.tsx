import { Head, Link } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Edit, Eye, FileText, Plus, School, ThumbsUp, XCircle } from 'lucide-react';

import { CustomPagination } from '@/components/custom-pagination';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { formatDate } from '@/lib/utils';
import type { Course, Department, ExamType, Semester } from '@/types';

type QuestionStatus = 'published' | 'pending_review' | 'rejected';

interface SubmissionItem {
    id: number;
    pdf_url: string | null;
    vote_score: number;
    views: number;
    created_at: string;
    question: {
        id: number;
        status: QuestionStatus;
        status_label: string;
        department: Department;
        course: Course;
        semester: Semester;
        exam_type: ExamType;
    };
}

interface SubmissionsData {
    data: SubmissionItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    submissions: SubmissionsData;
}

function StatusBadge({ status, label }: { status: QuestionStatus; label: string }) {
    const config = {
        published: { variant: 'default' as const, icon: CheckCircle, className: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' },
        pending_review: { variant: 'secondary' as const, icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20' },
        rejected: { variant: 'destructive' as const, icon: XCircle, className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20' },
    };

    const { icon: Icon, className } = config[status];

    return (
        <Badge variant="outline" className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {label}
        </Badge>
    );
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
                        <Link href="/dashboard/submissions/create">
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
                                                <Link href={`/questions/${submission.question.id}#submission=${submission.id}`}>
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <Link href={`/dashboard/submissions/${submission.id}/edit`}>
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
