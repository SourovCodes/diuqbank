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
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 dark:shadow-blue-500/5 dark:hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:-translate-y-1 h-full">
        {/* Gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-8 translate-x-8" />
        
        {/* Card Content */}
        <div className="relative p-4 md:p-5">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200/50 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-700/50 font-medium px-2 py-1"
              >
                <Building2 className="size-3 mr-1" />
                {question.departmentShortName || "N/A"}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50"
              >
                {question.examTypeName || "N/A"}
              </Badge>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-full">
              {question.viewCount} views
            </div>
          </div>

          {/* Course title */}
          <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 dark:group-hover:from-blue-400 dark:group-hover:to-cyan-300 transition-all duration-300">
            {question.courseName || "Unknown Course"}
          </h3>

          {/* Bottom section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Badge
                variant="outline"
                className="text-xs bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 w-fit"
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
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-4 text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
            >
              View PDF
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
