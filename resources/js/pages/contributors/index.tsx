import { CustomPagination } from '@/components/ui/custom-pagination';
import MainLayout from '@/layouts/main-layout';
import contributorsRoutes from '@/routes/contributors';
import type { PaginatedData, SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Eye, FileText, Users } from 'lucide-react';

// Types for contributor data
type Contributor = {
    id: number;
    name: string;
    username: string;
    student_id?: string;
    questions_count: number;
    total_views: number;
    profile_picture_url?: string;
};

interface ContributorsIndexProps extends SharedData {
    contributors: PaginatedData<Contributor>;
}

export default function ContributorsIndex({ contributors }: ContributorsIndexProps) {
    return (
        <MainLayout>
            <Head title="Contributors" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Contributors</h1>
                    <p className="text-slate-600 dark:text-slate-400">Community members who have shared questions</p>
                </div>

                {/* Contributors List */}
                {contributors.data.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <Users className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                        <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">No contributors yet</h3>
                        <p className="text-slate-600 dark:text-slate-400">Be the first to contribute questions!</p>
                    </div>
                ) : (
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {contributors.data.map((contributor) => (
                            <Link key={contributor.id} href={contributorsRoutes.show.url({ user: contributor.username })} className="group block">
                                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600">
                                    <div className="mb-4 flex items-start gap-4">
                                        {contributor.profile_picture_url ? (
                                            <img
                                                src={contributor.profile_picture_url}
                                                alt={contributor.name}
                                                className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                                <Users className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {contributor.name}
                                            </h3>
                                            {contributor.username && (
                                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">@{contributor.username}</p>
                                            )}
                                            {contributor.student_id && (
                                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">ID: {contributor.student_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <FileText className="mr-1.5 h-4 w-4" />
                                            <span className="font-medium">{contributor.questions_count}</span>
                                            <span className="ml-1">{contributor.questions_count === 1 ? 'question' : 'questions'}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <Eye className="mr-1.5 h-4 w-4" />
                                            <span className="font-medium">{contributor.total_views?.toLocaleString() ?? 0}</span>
                                            <span className="ml-1">views</span>
                                        </div>
                                    </div>

                                    <div className="absolute right-4 bottom-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-blue-900/50">
                                        <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {contributors.data.length > 0 && (
                    <div className="mt-6">
                        <CustomPagination currentPage={contributors.current_page} totalPages={contributors.last_page} />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
