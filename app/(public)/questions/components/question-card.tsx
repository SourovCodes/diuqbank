"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Clock } from "lucide-react";
import { PublicQuestion } from "../actions";

interface QuestionCardProps {
  question: PublicQuestion;
}

function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link href={`/questions/${question.id}`} className="block group">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 h-full flex flex-col">
        {/* Card Header with Type */}
        <div className="p-4 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/70">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {question.examTypeName || "N/A"}
          </div>
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
          >
            <Building2 className="size-3 mr-1" />
            {question.departmentShortName || "N/A"}
          </Badge>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {question.courseName || "Unknown Course"}
          </h3>

          <div className="flex items-center gap-2 mt-auto text-sm text-slate-500 dark:text-slate-400">
            <Badge
              variant="outline"
              className="text-xs bg-slate-50 dark:bg-slate-800/50"
            >
              <Calendar className="size-3 mr-1" />
              {question.semesterName || "N/A"}
            </Badge>
            {question.createdAt && (
              <span className="flex items-center text-xs">
                <Clock className="size-3 mr-1 text-slate-400" />
                {formatDate(question.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer with Stats and Action */}
        <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="text-sm text-slate-500 dark:text-slate-400"
              title="File size"
            >
              {formatFileSize(question.pdfFileSizeInBytes)}
            </div>
            <div
              className="text-sm text-slate-500 dark:text-slate-400"
              title="View count"
            >
              {question.viewCount} views
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40"
          >
            View
          </Button>
        </div>
      </div>
    </Link>
  );
}
