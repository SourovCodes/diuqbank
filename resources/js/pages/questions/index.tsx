import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

import { CustomPagination } from '@/components/custom-pagination';
import { QuestionCard } from '@/components/question-card';
import { QuestionFilters } from '@/components/question-filters';
import type { Course, Department, ExamType, Question, ResourcePaginatedData, Semester } from '@/types';

interface QuestionsIndexProps {
    questions: ResourcePaginatedData<Question>;
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
        <>
            <Head title="Questions" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
                    <p className="mt-2 text-muted-foreground">
                        Browse past exam questions by department, course, semester, and exam type.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <QuestionFilters initialFilters={filters} filterOptions={filterOptions} />
                </div>

                {/* Questions Grid */}
                {questions.data.length === 0 ? (
                    <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mb-2 text-lg font-medium">No questions found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your filters or check back later for new questions.
                        </p>
                    </div>
                ) : (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {questions.data.map((question) => (
                            <QuestionCard key={question.id} question={question} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {questions.data.length > 0 && questions.meta.last_page > 1 && (
                    <div className="mt-8">
                        <CustomPagination currentPage={questions.meta.current_page} totalPages={questions.meta.last_page} />
                    </div>
                )}
            </div>
        </>
    );
}
