import { Head } from "@inertiajs/react";
import MainLayout from "@/layouts/main-layout";
import type { SharedData } from "@/types";
import { QuestionFilters } from "@/components/ui/question-filters";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { QuestionCard } from "@/components/ui/question-card";
import { FileText } from "lucide-react";

// Types for question data
type Question = {
  id: number;
  created_at: string;
  view_count: number;
  department: string;
  course: string;
  semester: string;
  exam_type: string;
  section?: string | null;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedQuestions = {
  current_page: number;
  data: Question[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

interface QuestionsIndexProps extends SharedData {
  questions: PaginatedQuestions;
  filters: {
    department?: number | null;
    semester?: number | null;
    course?: number | null;
    examType?: number | null;
  };
  filterOptions: {
    departments: Array<{ id: number; name: string }>;
    semesters: Array<{ id: number; name: string }>;
    courses: Array<{ id: number; name: string; department_id: number }>;
    examTypes: Array<{ id: number; name: string }>;
  };
}

export default function QuestionsIndex({
  questions,
  filters,
  filterOptions,
}: QuestionsIndexProps) {
  return (
    <MainLayout>
      <Head title="Questions" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Questions
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <QuestionFilters
            initialFilters={filters}
            filterOptions={filterOptions}
          />
        </div>

        {/* Questions List */}
        {questions.data.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No questions found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {questions.data.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {questions.data.length > 0 && (
          <div className="mt-6">
            <CustomPagination
              currentPage={questions.current_page}
              totalPages={questions.last_page}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
