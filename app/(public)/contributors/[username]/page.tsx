import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContributor, getContributorQuestions } from "../actions";
import { ContributorHeader } from "./components/contributor-header";
import { ContributorQuestionCard } from "./components/contributor-question-card";
import { CustomPagination } from "@/components/custom-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: ContributorDetailPageProps): Promise<Metadata> {
  const { username } = await params;

  const result = await getPublicContributor(username);

  if (!result.success) {
    return {
      title: "Contributor Not Found",
    };
  }

  const contributor = result.data!;

  return {
    title: `${contributor.name} - DIU Question Bank Contributor`,
    description: `View ${contributor.name}'s contributions to DIU Question Bank. ${contributor.questionCount} questions contributed with ${contributor.totalViews} total views.`,
  };
}

interface ContributorDetailPageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Empty state component for questions
function EmptyQuestionsState() {
  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
      <CardContent className="px-6 py-0 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No questions yet
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This contributor hasn&apos;t shared any questions yet.
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
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </CardContent>
    </Card>
  );
}

async function ContributorDetailContent({
  params,
  searchParams,
}: ContributorDetailPageProps) {
  const { username } = await params;
  const searchParam = await searchParams;
  const page = parseInt(searchParam.page ?? "1", 10);

  // Fetch contributor details and questions in parallel
  const [contributorResult, questionsResult] = await Promise.all([
    getPublicContributor(username),
    getContributorQuestions(username, page, 12),
  ]);

  if (!contributorResult.success) {
    notFound();
  }

  const contributor = contributorResult.data!;

  if (!questionsResult.success) {
    return (
      <div className="space-y-6 md:space-y-8">
        <ContributorHeader contributor={contributor} />
        <ErrorState message="Failed to load questions. Please try again later." />
      </div>
    );
  }

  const { questions, pagination } = questionsResult.data!;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Contributor Header */}
      <ContributorHeader contributor={contributor} />

      {/* Questions Section */}
      <div className="space-y-6 md:space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 py-6">
          <div className="px-6">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Contributed Questions
              {pagination.totalCount > 0 && (
                <span className="text-base font-normal text-slate-600 dark:text-slate-400 ml-2">
                  ({pagination.totalCount} total)
                </span>
              )}
            </h2>

            {/* Questions List */}
            {questions.length === 0 ? (
              <EmptyQuestionsState />
            ) : (
              <>
                <div className="grid gap-5 md:gap-6">
                  {questions.map((question) => (
                    <ContributorQuestionCard
                      key={question.id}
                      question={question}
                    />
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
      </div>
    </div>
  );
}

export default async function ContributorDetailPage(
  props: ContributorDetailPageProps
) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContributorDetailContent {...props} />
    </div>
  );
}
