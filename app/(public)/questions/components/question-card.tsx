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
      <Card className="relative overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4">
        <CardContent className="px-4 py-0 relative z-10 flex flex-col h-full">
          {/* Title */}
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
            {question.courseName || "Unknown Course"}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge
              variant="secondary"
              className="h-6 px-2 text-xs bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Building2 className="h-3 w-3" />
              {question.departmentShortName || "N/A"}
            </Badge>
            <Badge className="h-6 px-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {question.examTypeName || "N/A"}
            </Badge>
            <Badge className="h-6 px-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {question.semesterName || "N/A"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="mt-auto text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {question.createdAt && (
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Eye className="mr-1 h-3 w-3" />
              <span>{question.viewCount} views</span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-1 h-3 w-3" />
              <span>{formatFileSize(question.pdfFileSizeInBytes)}</span>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
