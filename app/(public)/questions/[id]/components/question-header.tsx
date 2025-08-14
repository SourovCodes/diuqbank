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
    <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10">
      {/* Gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
      
      <div className="relative p-6 md:p-8">
        <div className="space-y-4 md:space-y-6">
          {/* Course Title and Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200/50 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-700/50 font-medium px-3 py-1.5"
              >
                <Building2 className="h-3 w-3 mr-1" />
                {question.departmentShortName || "N/A"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 px-3 py-1.5"
              >
                {question.examTypeName || "N/A"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 px-3 py-1.5"
              >
                {question.semesterName || "N/A"}
              </Badge>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                {question.courseName || "Unknown Course"}
              </span>
            </h1>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm md:text-base">{question.viewCount} views</span>
              </div>
              {question.createdAt && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-sm md:text-base">
                    Added {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-600/50 rounded-full font-medium"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
