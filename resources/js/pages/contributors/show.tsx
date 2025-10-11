import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/layouts/main-layout";
import type { SharedData, PaginatedData } from "@/types";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { Question, QuestionCard } from "@/components/ui/question-card";
import { ArrowLeft, FileText, User } from "lucide-react";

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

export default function ContributorShow({
  contributor,
  questions,
}: ContributorShowProps) {
  return (
    <MainLayout>
      <Head title={`${contributor.name} - Contributors`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/contributors"
          className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Contributors
        </Link>

        {/* Contributor Header */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            {contributor.profile_picture_url ? (
              <img
                src={contributor.profile_picture_url}
                alt={contributor.name}
                className="h-16 w-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-blue-700 dark:text-blue-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {contributor.name}
              </h1>

              {contributor.username && (
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  @{contributor.username}
                </p>
              )}

              {contributor.student_id && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Student ID: {contributor.student_id}
                </p>
              )}

              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {contributor.questions_count}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {contributor.questions_count === 1
                      ? "Question"
                      : "Questions"}
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {contributor.total_views.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Questions by {contributor.name}
          </h2>

          {questions.data.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No questions yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                This contributor hasn't uploaded any questions yet.
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
      </div>
    </MainLayout>
  );
}
