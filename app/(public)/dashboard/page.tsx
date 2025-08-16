import { redirect } from "next/navigation";
import { Metadata } from "next";
// Removed Suspense import since we're not using skeleton loading
import { auth } from "@/lib/auth";
import { getCurrentUser } from "../edit-profile/actions";
import { getUserQuestions, getUserStats } from "./actions";
import { ProfileSection } from "./components/profile-section";
import { UserQuestionCard } from "./components/user-question-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/custom-pagination";
import { 
  FileText, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | DIU QBank",
  description: "Manage your profile and questions",
};

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    tab?: string;
  }>;
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Removed LoadingSkeleton component as per user request

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const statusFilter = awaitedSearchParams.status || "all";
  const activeTab = awaitedSearchParams.tab || "questions";

  // Get user data
  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.data) {
    redirect("/login");
  }

  const user = userResult.data;

  // Get user stats and questions in parallel
  const [statsResult, questionsResult] = await Promise.all([
    getUserStats(),
    getUserQuestions(page, 12, statusFilter),
  ]);

  const stats = statsResult.success && statsResult.data ? statsResult.data : {
    totalQuestions: 0,
    publishedQuestions: 0,
    pendingQuestions: 0,
    totalViews: 0,
  };

  const questions = questionsResult.success ? questionsResult.data?.questions ?? [] : [];
  const pagination = questionsResult.success 
    ? questionsResult.data?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 }
    : { currentPage: 1, totalPages: 1, totalCount: 0 };

  const statusFilters = [
    { value: "all", label: "All Questions", count: stats.totalQuestions },
    { value: "published", label: "Published", count: stats.publishedQuestions },
    { value: "pending_review", label: "Pending", count: stats.pendingQuestions },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Welcome back,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            {user.name?.split(" ")[0]}
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          Manage your profile information and track your question contributions to the DIU community.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <Link
          href="/dashboard?tab=questions"
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "questions"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          My Questions
        </Link>
        <Link
          href="/dashboard?tab=profile"
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Profile
        </Link>
      </div>

      {activeTab === "questions" ? (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Questions"
              value={stats.totalQuestions}
              icon={FileText}
              description="Questions submitted"
            />
            <StatsCard
              title="Published"
              value={stats.publishedQuestions}
              icon={CheckCircle}
              description="Live questions"
            />
            <StatsCard
              title="Pending Review"
              value={stats.pendingQuestions}
              icon={Clock}
              description="Awaiting approval"
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              icon={TrendingUp}
              description="On published questions"
            />
          </div>

          {/* Questions Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  My Questions
                </CardTitle>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/questions/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit New Question
                  </Link>
                </Button>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {statusFilters.map((filter) => (
                  <Link
                    key={filter.value}
                    href={`/dashboard?tab=questions&status=${filter.value}`}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === filter.value
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {filter.label}
                    <Badge variant="secondary" className="h-5 text-xs">
                      {filter.count}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {statusFilter === "all" 
                      ? "No questions submitted yet"
                      : `No ${statusFilter.replace("_", " ")} questions`
                    }
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {statusFilter === "all"
                      ? "Start contributing to the DIU community by submitting your first question paper."
                      : `You don't have any ${statusFilter.replace("_", " ")} questions at the moment.`
                    }
                  </p>
                  {statusFilter === "all" && (
                    <Button asChild>
                      <Link href="/questions/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Your First Question
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <UserQuestionCard key={question.id} question={question} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center pt-6">
                      <CustomPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <ProfileSection user={user} />
      )}
    </div>
  );
}

export default async function DashboardPage(props: DashboardPageProps) {
  // Check authentication first
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardContent {...props} />;
}
