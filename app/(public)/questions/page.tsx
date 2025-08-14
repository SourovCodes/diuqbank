import { Metadata } from "next";
import { FileText, AlertCircle, Library } from "lucide-react";
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
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
      <CardContent className="px-6 py-0 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No questions found
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Try adjusting your filters to see more questions.
        </p>
      </CardContent>
    </Card>
  );
}

// Error state component
function ErrorState({ message }: { message: string }) {
  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 shadow-sm py-6">
      <CardContent className="px-6 py-0 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
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
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm py-4">
        <CardContent className="px-4 py-0">
          <QuestionFilters filterOptions={filterOptions} />
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6 md:space-y-8">
        {pagination.totalCount > 0 && (
          <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
            <CardContent className="px-6 py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Library className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                  {pagination.totalCount} Questions Found
                </h2>
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                Page {pagination.currentPage} / {pagination.totalPages}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Grid */}
        {questions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-5 md:gap-6">
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
    <div className="container mx-auto px-4 py-8">
      <QuestionsContent {...props} />
    </div>
  );
}
