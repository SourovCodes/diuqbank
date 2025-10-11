import { Link } from "@inertiajs/react";
import { School, Calendar, Clock, Eye, ArrowRight } from "lucide-react";

type Question = {
  id: number;
  created_at: string;
  view_count: number;
  department: string;
  course: string;
  semester: string;
  exam_type: string;
  section?: string | null;
};

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/questions/${question.id}`} className="block group">
      <div className="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4 rounded-xl">
        <div className="px-4 py-0 relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
              {question.course}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Add any badges or icons here if needed */}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 text-xs">
              <School className="h-3.5 w-3.5" />
              {question.department}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-xs">
              {question.exam_type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 text-xs">
              <Calendar className="h-3 w-3" />
              {question.semester}
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
          </div>

          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}
