import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/layouts/main-layout";
import type { SharedData } from "@/types";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { Users, FileText, Eye, ArrowRight } from "lucide-react";

// Types for contributor data
type Contributor = {
  id: number;
  name: string;
  username?: string;
  student_id?: string;
  questions_count: number;
  total_views: number;
  profile_picture_url?: string;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedContributors = {
  current_page: number;
  data: Contributor[];
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

interface ContributorsIndexProps extends SharedData {
  contributors: PaginatedContributors;
}

export default function ContributorsIndex({
  contributors,
}: ContributorsIndexProps) {
  return (
    <MainLayout>
      <Head title="Contributors" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Contributors
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Community members who have shared questions
          </p>
        </div>

        {/* Contributors List */}
        {contributors.data.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No contributors yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Be the first to contribute questions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {contributors.data.map((contributor) => (
              <Link
                key={contributor.id}
                href={`/contributors/${contributor.id}`}
                className="block group"
              >
                <div className="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 p-6 rounded-xl">
                  <div className="flex items-start gap-4 mb-4">
                    {contributor.profile_picture_url ? (
                      <img
                        src={contributor.profile_picture_url}
                        alt={contributor.name}
                        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {contributor.name}
                      </h3>
                      {contributor.username && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          @{contributor.username}
                        </p>
                      )}
                      {contributor.student_id && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          ID: {contributor.student_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="mr-1.5 h-4 w-4" />
                      <span className="font-medium">
                        {contributor.questions_count}
                      </span>
                      <span className="ml-1">
                        {contributor.questions_count === 1
                          ? "question"
                          : "questions"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Eye className="mr-1.5 h-4 w-4" />
                      <span className="font-medium">
                        {contributor.total_views?.toLocaleString() ?? 0}
                      </span>
                      <span className="ml-1">views</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {contributors.data.length > 0 && (
          <div className="mt-6">
            <CustomPagination
              currentPage={contributors.current_page}
              totalPages={contributors.last_page}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
