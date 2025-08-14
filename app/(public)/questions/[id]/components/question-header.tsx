"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Download,
  Share2
} from "lucide-react";

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



export function QuestionHeader({ question, pdfUrl }: QuestionHeaderProps) {
  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${question.courseName} - ${question.departmentShortName}`,
            text: `Check out this ${question.examTypeName} question paper for ${question.courseName}`,
            url: window.location.href,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          // You could add a toast notification here
        } catch (error) {
          console.error('Error copying to clipboard:', error);
        }
      }
    }
  };

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Course Title and Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary">
              <Building2 className="h-3 w-3 mr-1" />
              {question.departmentShortName || "N/A"}
            </Badge>
            <Badge variant="outline">
              {question.examTypeName || "N/A"}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {question.courseName || "Unknown Course"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {question.semesterName} • {question.viewCount} views
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
