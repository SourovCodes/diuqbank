import { Metadata } from "next";
import { FileText, AlertCircle } from "lucide-react";
import { getPublicQuestions, getFilterOptions } from "./actions";
import { QuestionFilters } from "./components/question-filters";
import { QuestionCard } from "./components/question-card";
import { CustomPagination } from "@/components/custom-pagination";

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
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        Try adjusting your filters to see more questions.
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
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 md:space-y-6">
        <div className="relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100">
            Exam{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Questions
            </span>
          </h1>
          <div className="mx-auto w-16 md:w-20 h-1 md:h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mt-4"></div>
        </div>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Browse and download exam question papers from our comprehensive collection
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-md">
        <QuestionFilters filterOptions={filterOptions} />
      </div>

      {/* Results Section */}
      <div className="space-y-4 md:space-y-6">
        {pagination.totalCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                {pagination.totalCount}
              </span>{" "}
              Questions Found
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        )}

        {/* Questions Grid */}
        {questions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 md:gap-6">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-6 md:pt-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-md">
                  <CustomPagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default async function QuestionsPage(props: QuestionsPageProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <QuestionsContent {...props} />
    </div>
  );
}
