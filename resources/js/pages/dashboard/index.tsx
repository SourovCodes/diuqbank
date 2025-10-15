import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { QuestionCard } from '@/components/ui/question-card';
import { StatsCard } from '@/components/ui/stats-card';
import MainLayout from '@/layouts/main-layout';
import profileRoutes from '@/routes/profile';
import questionsRoutes from '@/routes/questions';
import type { DashboardStats, PaginatedData, QuestionResource, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Eye, FileText, Plus, User, XCircle } from 'lucide-react';

interface DashboardProps extends SharedData {
    stats: DashboardStats;
    questions: PaginatedData<QuestionResource>;
}

export default function Dashboard({ stats, questions }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <MainLayout>
            <Head title="Dashboard" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Welcome back, {auth.user.name}</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            asChild
                            className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                        >
                            <Link href={questionsRoutes.create.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full border-slate-300 px-6 font-medium dark:border-slate-600">
                            <Link href={profileRoutes.edit.url()}>
                                <User className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatsCard title="Total Questions" value={stats.total_questions} icon={FileText} iconColor="text-blue-600 dark:text-blue-400" />
                    <StatsCard title="Published" value={stats.published} icon={CheckCircle2} iconColor="text-green-600 dark:text-green-400" />
                    <StatsCard title="Pending Review" value={stats.pending_review} icon={Clock} iconColor="text-yellow-600 dark:text-yellow-400" />
                    <StatsCard title="Need Fix" value={stats.need_fix} icon={XCircle} iconColor="text-red-600 dark:text-red-400" />
                    <StatsCard title="Total Views" value={stats.total_views} icon={Eye} iconColor="text-purple-600 dark:text-purple-400" />
                </div>

                {/* Questions Section */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Your Questions</h2>

                    {questions.data.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                            <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">No questions yet</h3>
                            <p className="mb-4 text-slate-600 dark:text-slate-400">Start contributing by adding your first question.</p>
                            <Button
                                asChild
                                className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                            >
                                <Link href={questionsRoutes.create.url()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Question
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 space-y-4">
                                {questions.data.map((question) => (
                                    <QuestionCard key={question.id} question={question} currentUserId={auth?.user?.id} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {questions.last_page > 1 && (
                                <div className="mt-6">
                                    <CustomPagination currentPage={questions.current_page} totalPages={questions.last_page} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
