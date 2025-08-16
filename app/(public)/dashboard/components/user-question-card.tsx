"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Edit, 
  Download, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { QuestionStatus } from "@/db/schema";
import type { UserQuestion } from "../actions";

interface UserQuestionCardProps {
  question: UserQuestion;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case QuestionStatus.PUBLISHED:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </Badge>
      );
    case QuestionStatus.PENDING_REVIEW:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    case QuestionStatus.REJECTED:
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
  }
}

export function UserQuestionCard({ question }: UserQuestionCardProps) {
  const pdfUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${question.pdfKey}`;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white leading-tight">
                  {question.courseName || "Unknown Course"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {question.departmentShortName || "Unknown Dept"}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {question.semesterName || "Unknown Semester"}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {question.examTypeName || "Unknown Type"}
                  </span>
                </div>
              </div>
              {getStatusBadge(question.status)}
            </div>

            {/* File Info */}
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{formatFileSize(question.pdfFileSizeInBytes)}</span>
              </div>
              {question.status === QuestionStatus.PUBLISHED && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.viewCount} views</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Submitted: {formatDate(question.createdAt)}</span>
              {question.updatedAt.getTime() !== question.createdAt.getTime() && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>Updated: {formatDate(question.updatedAt)}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
            {/* Edit Button - Always available for own questions */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-3"
            >
              <Link href={`/questions/${question.id}/edit`}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Link>
            </Button>

            {/* View/Download Button */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-3"
            >
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                {question.status === QuestionStatus.PUBLISHED ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </>
                )}
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
