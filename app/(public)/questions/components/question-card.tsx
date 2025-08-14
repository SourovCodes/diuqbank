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
      <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5 h-full">

        
        {/* Card Content */}
        <div className="relative p-4 md:p-5">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 font-medium px-2 py-1"
              >
                <Building2 className="size-3 mr-1" />
                {question.departmentShortName || "N/A"}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              >
                {question.examTypeName || "N/A"}
              </Badge>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {question.viewCount} views
            </div>
          </div>

          {/* Course title */}
          <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {question.courseName || "Unknown Course"}
          </h3>

          {/* Bottom section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Badge
                variant="outline"
                className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 w-fit"
              >
                <Calendar className="size-3 mr-1" />
                {question.semesterName || "N/A"}
              </Badge>
              <div className="flex items-center gap-3 text-xs">
                {question.createdAt && (
                  <span className="flex items-center">
                    <Clock className="size-3 mr-1 text-slate-400" />
                    {formatDate(question.createdAt)}
                  </span>
                )}
                <span title="File size">
                  {formatFileSize(question.pdfFileSizeInBytes)}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-full px-4 text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
            >
              View PDF
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
