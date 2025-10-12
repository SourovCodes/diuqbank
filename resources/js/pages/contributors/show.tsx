import { CustomPagination } from '@/components/ui/custom-pagination';
import { Question, QuestionCard } from '@/components/ui/question-card';
import MainLayout from '@/layouts/main-layout';
import contributorsRoutes from '@/routes/contributors';
import type { PaginatedData, SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, User } from 'lucide-react';

type Contributor = {
    id: number;
    name: string;
    username?: string;
    student_id?: string;
    questions_count: number;
    total_views: number;
    profile_picture_url?: string;
};

interface ContributorShowProps extends SharedData {
    contributor: Contributor;
    questions: PaginatedData<Question>;
}

export default function ContributorShow({ contributor, questions }: ContributorShowProps) {
    return (
        <MainLayout>
            <Head title={`${contributor.name} - Contributors`} />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href={contributorsRoutes.index.url()}
                    className="mb-6 inline-flex items-center text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Contributors
                </Link>

                {/* Contributor Header */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        {contributor.profile_picture_url ? (
                            <img
                                src={contributor.profile_picture_url}
                                alt={contributor.name}
                                className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <User className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">{contributor.name}</h1>

                            {contributor.username && <p className="mb-2 text-slate-600 dark:text-slate-400">@{contributor.username}</p>}

                            {contributor.student_id && (
                                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Student ID: {contributor.student_id}</p>
                            )}

                            <div className="flex flex-wrap gap-6">
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{contributor.questions_count}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {contributor.questions_count === 1 ? 'Question' : 'Questions'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {contributor.total_views.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Views</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Questions by {contributor.name}</h2>

                    {questions.data.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                            <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">No questions yet</h3>
                            <p className="text-slate-600 dark:text-slate-400">This contributor hasn't uploaded any questions yet.</p>
                        </div>
                    ) : (
                        <div className="mb-6 space-y-4">
                            {questions.data.map((question) => (
                                <QuestionCard key={question.id} question={question} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {questions.data.length > 0 && (
                        <div className="mt-6">
                            <CustomPagination currentPage={questions.current_page} totalPages={questions.last_page} />
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
