"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  Clock,
  Eye,
  FileText,
  ArrowRight,
} from "lucide-react";
import { ContributorQuestion } from "../../actions";

interface ContributorQuestionCardProps {
  question: ContributorQuestion;
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

export function ContributorQuestionCard({
  question,
}: ContributorQuestionCardProps) {
  return (
    <Link href={`/questions/${question.id}`} className="block group">
      <Card className="relative overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4">
        <CardContent className="px-4 py-0 relative z-10 flex flex-col h-full">
          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-4">
            {question.courseName || "Unknown Course"}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Building2 className="h-3.5 w-3.5" />
              {question.departmentShortName || "N/A"}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
              {question.examTypeName || "N/A"}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
              <Calendar className="h-3 w-3 mr-1" />
              {question.semesterName || "N/A"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="mt-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 mb-3">
            {question.createdAt && (
              <div className="flex items-center">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              <span>{question.viewCount} views</span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              <span>{formatFileSize(question.pdfFileSizeInBytes)}</span>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
