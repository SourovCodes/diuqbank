import { Metadata } from "next";
import { Users, AlertCircle, UserCheck } from "lucide-react";
import { getPublicContributors } from "./actions";
import { ContributorCard } from "./components/contributor-card";
import { CustomPagination } from "@/components/custom-pagination";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contributors",
  description:
    "Meet the amazing contributors who share exam question papers on DIU Question Bank",
};

interface ContributorsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

// Empty state component
function EmptyState() {
  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
      <CardContent className="px-6 py-0 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
          <Users className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No contributors found
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Be the first to contribute question papers to our community!
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

async function ContributorsContent({ searchParams }: ContributorsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const contributorsResult = await getPublicContributors(page, 12);

  if (!contributorsResult.success) {
    return (
      <ErrorState message="Failed to load contributors. Please try again later." />
    );
  }

  const { contributors, pagination } = contributorsResult.data!;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
        <CardContent className="px-6 py-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Contributors
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Meet the amazing people who share knowledge with our community
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6 md:space-y-8">
        {pagination.totalCount > 0 && (
          <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm py-6">
            <CardContent className="px-6 py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <UserCheck className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                  {pagination.totalCount} Contributors Found
                </h2>
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                Page {pagination.currentPage} / {pagination.totalPages}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributors Grid */}
        {contributors.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {contributors.map((contributor) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
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
  );
}

export default async function ContributorsPage(props: ContributorsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContributorsContent {...props} />
    </div>
  );
}
