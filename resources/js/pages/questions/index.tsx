import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/layouts/main-layout";
import type { SharedData } from "@/types";
import { QuestionFilters } from "@/components/ui/question-filters";
import { CustomPagination } from "@/components/ui/custom-pagination";
import {
  School,
  Calendar,
  Clock,
  Eye,
  FileText,
  ArrowRight,
} from "lucide-react";

// Types for question data
type Question = {
  id: number;
  created_at: string;
  view_count: number;
  pdf_size: number;
  department: {
    id: number;
    name: string;
    short_name: string;
  };
  course: {
    id: number;
    name: string;
  };
  semester: {
    id: number;
    name: string;
  };
  exam_type: {
    id: number;
    name: string;
  };
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
    department?: string;
    semester?: string;
    course?: string;
    examType?: string;
  };
  filterOptions: {
    departments: Array<{ name: string }>;
    semesters: Array<{ name: string }>;
    courses: Array<{ name: string }>;
    examTypes: Array<{ name: string }>;
  };
}

export default function QuestionsIndex({
  questions,
  filters,
  filterOptions,
}: QuestionsIndexProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

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
              <Link
                key={question.id}
                href={`/questions/${question.id}`}
                className="block group"
              >
                <div className="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4 rounded-xl">
                  <div className="px-4 py-0 relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                        {question.course.name}
                      </h3>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Add any badges or icons here if needed */}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 text-xs">
                        <School className="h-3.5 w-3.5" />
                        {question.department.short_name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-xs">
                        {question.exam_type.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {question.semester.name}
                      </span>
                    </div>

                    <div className="mt-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 mb-3">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        <span>{formatDate(question.created_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        <span>{question.view_count} views</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        <span>{formatFileSize(question.pdf_size)} MB</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </Link>
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
