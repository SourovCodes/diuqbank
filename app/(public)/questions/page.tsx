import { Metadata } from "next";
import { FileText, AlertCircle } from "lucide-react";
import { getPublicQuestions, getFilterOptions } from "./actions";
import { QuestionFilters } from "./components/question-filters";
import { QuestionCard } from "./components/question-card";
import { CustomPagination } from "@/components/custom-pagination";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "Browse and download exam question papers from DIU Question Bank",
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
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
      <CardContent className="p-10 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          No questions found
        </h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Try adjusting your filters to see more questions.
        </p>
      </CardContent>
    </Card>
  );
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 shadow-md">
      <CardContent className="p-10 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          Something went wrong
        </h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}

async function QuestionsContent({ searchParams }: QuestionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const departmentId = params.department
    ? parseInt(params.department)
    : undefined;
  const courseId = params.course ? parseInt(params.course) : undefined;
  const semesterId = params.semester ? parseInt(params.semester) : undefined;
  const examTypeId = params.examType ? parseInt(params.examType) : undefined;

  // Fetch data in parallel
  const [questionsResult, filterOptions] = await Promise.all([
    getPublicQuestions(
      page,
      12,
      departmentId,
      courseId,
      semesterId,
      examTypeId
    ),
    getFilterOptions(),
  ]);

  if (!questionsResult.success) {
    return (
      <ErrorState message="Failed to load questions. Please try again later." />
    );
  }

  const { questions, pagination } = questionsResult.data!;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Filters Section */}
      <Card className="mb-10 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardContent className="p-6 md:p-8">
          <QuestionFilters filterOptions={filterOptions} />
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6 md:space-y-8">
        {pagination.totalCount > 0 && (
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                    {pagination.totalCount}
                  </span>{" "}
                  Questions Found
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Questions Grid */}
        {questions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-6 md:gap-8">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-8 md:pt-10">
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

export default async function QuestionsPage(props: QuestionsPageProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <QuestionsContent {...props} />
    </div>
  );
}
