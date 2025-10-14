import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { QuestionCard } from '@/components/ui/question-card';
import { QuestionFilters } from '@/components/ui/question-filters';
import MainLayout from '@/layouts/main-layout';
import questionsRoutes from '@/routes/questions';
import type { Course, Department, ExamType, PaginatedData, QuestionResource, Semester, SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';

interface QuestionsIndexProps extends SharedData {
    questions: PaginatedData<QuestionResource>;
    filters: {
        department?: number | null;
        semester?: number | null;
        course?: number | null;
        examType?: number | null;
    };
    filterOptions: {
        departments: Department[];
        semesters: Semester[];
        courses: Course[];
        examTypes: ExamType[];
    };
}

export default function QuestionsIndex({ questions, filters, filterOptions }: QuestionsIndexProps) {
    return (
        <MainLayout>
            <Head title="Questions" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Questions</h1>

                    <Button
                        asChild
                        className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                    >
                        <Link href={questionsRoutes.create.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Question
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <QuestionFilters initialFilters={filters} filterOptions={filterOptions} />
                </div>

                {/* Questions List */}
                {questions.data.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                        <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">No questions found</h3>
                        <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters or check back later.</p>
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
        </MainLayout>
    );
}
