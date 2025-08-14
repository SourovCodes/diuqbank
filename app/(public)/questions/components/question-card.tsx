"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  Building2,
  BookOpen,
  GraduationCap,
  Clock
} from "lucide-react";
import { PublicQuestion } from "../actions";
import { formatDistanceToNow } from "date-fns";

interface QuestionCardProps {
  question: PublicQuestion;
}

function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 text-xs font-medium"
              >
                <Building2 className="h-3 w-3 mr-1" />
                {question.departmentShortName || "N/A"}
              </Badge>
              <Badge 
                variant="outline"
                className="text-xs"
              >
                {question.examTypeName || "N/A"}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {question.courseName || "Unknown Course"}
            </h3>
          </div>
          
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {/* Question Details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate">{question.semesterName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{question.userName || "Anonymous"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{question.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{formatFileSize(question.pdfFileSizeInBytes)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm hover:shadow-md transition-all text-sm h-9"
          >
            <Link href={`/questions/${question.id}`}>
              <Download className="h-4 w-4 mr-2" />
              View & Download
            </Link>
          </Button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
