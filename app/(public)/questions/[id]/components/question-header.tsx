"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    userId: string | null;
    userUsername: string | null;
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
    <Card className="shadow-sm py-6">
      <CardHeader className="pb-0 px-6 pt-0">
        <CardTitle className="text-2xl md:text-3xl font-semibold leading-snug">
          {question.courseName || "Unknown Course"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-6 pb-0 space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {question.departmentShortName || "N/A"}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5">
            {question.examTypeName || "N/A"}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {question.semesterName || "N/A"}
          </Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1.5 ml-auto">
            {question.viewCount} views
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {question.createdAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(question.createdAt)}
            </div>
          )}
          <div className="flex items-center gap-2">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {formatFileSize(question.pdfFileSizeInBytes)}
          </div>
          {question.userName && question.userUsername && (
            <Link
              href={`/contributors/${question.userUsername}`}
              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {question.userName}
            </Link>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow rounded-full px-6 h-10"
          >
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="rounded-full h-10 border-slate-200 dark:border-slate-700 bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
