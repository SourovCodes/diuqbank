"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye, 
  Building2,
  ArrowRight
} from "lucide-react";
import { PublicQuestion } from "../actions";

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
    <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="p-6">
        <div className="flex items-center gap-4">
          {/* PDF Icon */}
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {question.departmentShortName || "N/A"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.examTypeName || "N/A"}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {question.courseName || "Unknown Course"}
            </h3>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{question.semesterName || "N/A"}</span>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{question.viewCount}</span>
              </div>
              <span>{formatFileSize(question.pdfFileSizeInBytes)}</span>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm"
            >
              <Link href={`/questions/${question.id}`} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
