"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Download, Share2, Calendar, Clock } from "lucide-react";

interface QuestionHeaderProps {
  question: {
    id: number;
    pdfKey: string;
    pdfFileSizeInBytes: number;
    viewCount: number;
    createdAt: Date;
    departmentName: string | null;
    departmentShortName: string | null;
    courseName: string | null;
    semesterName: string | null;
    examTypeName: string | null;
    userName: string | null;
  };
  pdfUrl: string;
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

export function QuestionHeader({ question, pdfUrl }: QuestionHeaderProps) {
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${question.courseName} - ${question.departmentShortName}`,
            text: `Check out this ${question.examTypeName} question paper for ${question.courseName}`,
            url: window.location.href,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          // You could add a toast notification here
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }
    }
  };

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Subtle gradient overlay for modern look */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50 -z-10"></div>
      {/* Decorative accent circles */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-100/30 dark:bg-blue-900/10 -z-10"></div>
      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-purple-100/30 dark:bg-purple-900/10 -z-10"></div>

      <div className="p-6 md:p-8 relative z-10">
        {/* Title */}
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            {question.courseName || "Unknown Course"}
          </span>
        </h1>

        {/* Categorization with badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Department badge */}
          <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-3 py-1.5">
            <Building2 className="h-4 w-4" />
            {question.departmentShortName || "N/A"}
          </Badge>

          {/* Exam type badge */}
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5 px-3 py-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            {question.examTypeName || "N/A"}
          </Badge>

          {/* Semester badge */}
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1.5 px-3 py-1.5">
            <Calendar className="h-4 w-4" />
            {question.semesterName || "N/A"}
          </Badge>

          {/* Views badge */}
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1.5 px-3 py-1.5 ml-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {question.viewCount} views
          </Badge>
        </div>

        {/* Meta row (date + file size + uploader) */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-600 dark:text-slate-300 mb-8 border-t border-b border-slate-200 dark:border-slate-700/70 py-4">
          {question.createdAt && (
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-slate-500 dark:text-slate-400" />
              Added {formatDate(question.createdAt)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {formatFileSize(question.pdfFileSizeInBytes)}
          </div>
          {question.userName && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-500 dark:text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Uploaded by {question.userName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-full px-6 py-2.5 font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-400 rounded-full font-medium px-6 py-2.5"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Question
          </Button>
        </div>
      </div>
    </div>
  );
}
