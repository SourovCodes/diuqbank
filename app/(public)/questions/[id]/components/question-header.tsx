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
    <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6">
        {/* Top row: badges + views pill */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
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
            <Badge
              variant="outline"
              className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
            >
              <Calendar className="size-3 mr-1" />
              {question.semesterName || "N/A"}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full w-fit self-start">
            {question.viewCount} views
          </div>
        </div>

        {/* Title */}
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl text-slate-900 dark:text-slate-100 mb-4 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            {question.courseName || "Unknown Course"}
          </span>
        </h1>

        {/* Meta row (date + file size + uploader) */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-5">
          {question.createdAt && (
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              Added {formatDate(question.createdAt)}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Download className="size-3" />
            {formatFileSize(question.pdfFileSizeInBytes)}
          </div>
          {question.userName && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Uploaded by {question.userName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-full px-5 font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-full font-medium px-5"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Question
          </Button>
        </div>
      </div>
    </div>
  );
}
