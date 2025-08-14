import { Suspense } from "react";
import { Metadata } from "next";
import { FileText, Filter, AlertCircle, Loader2 } from "lucide-react";
import { getPublicQuestions, getFilterOptions, PublicQuestion } from "./actions";
import { QuestionFilters } from "./components/question-filters";
import { QuestionCard } from "./components/question-card";
import { CustomPagination } from "@/components/custom-pagination";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Questions",
  description: "Browse and download exam question papers from DIU Question Bank",
};

interface QuestionsPageProps {
  searchParams: Promise<{
    page?: string;
    department?: string;
    course?: string;
    semester?: string;
    examType?: string;
  }>;
}

// Loading skeleton for questions grid
function QuestionsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        No questions found
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
        We couldn't find any questions matching your current filters. Try adjusting your search criteria or clearing the filters.
      </p>
    </div>
  );
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Something went wrong
      </h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
}

async function QuestionsContent({ searchParams }: QuestionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const departmentId = params.department ? parseInt(params.department) : undefined;
  const courseId = params.course ? parseInt(params.course) : undefined;
  const semesterId = params.semester ? parseInt(params.semester) : undefined;
  const examTypeId = params.examType ? parseInt(params.examType) : undefined;

  // Fetch data in parallel
  const [questionsResult, filterOptions] = await Promise.all([
    getPublicQuestions(page, 12, departmentId, courseId, semesterId, examTypeId),
    getFilterOptions(),
  ]);

  if (!questionsResult.success) {
    return <ErrorState message="Failed to load questions. Please try again later." />;
  }

  const { questions, pagination } = questionsResult.data!;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Question Bank</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Exam Questions
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Discover and download exam question papers from various departments, courses, and semesters.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <QuestionFilters filterOptions={filterOptions} />
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Available Questions
            </h2>
            <Badge variant="secondary" className="px-2 py-1">
              {pagination.totalCount} total
            </Badge>
          </div>
          
          {pagination.totalCount > 0 && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
              {pagination.totalCount} questions
            </div>
          )}
        </div>

        {/* Questions Grid */}
        {questions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <CustomPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function QuestionsPage(props: QuestionsPageProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense 
        fallback={
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto animate-pulse" />
              <div className="h-10 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
              <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="space-y-4">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Grid Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <QuestionsGridSkeleton />
            </div>
          </div>
        }
      >
        <QuestionsContent {...props} />
      </Suspense>
    </div>
  );
}
