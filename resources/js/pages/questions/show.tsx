import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "@/layouts/main-layout";
import type { SharedData } from "@/types";
import {
  ArrowLeft,
  School,
  Calendar,
  Book,
  FileText,
  Clock,
  Eye,
  Download,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

// Types for question data
type Question = {
  id: number;
  created_at: string;
  view_count: number;
  pdf_size: number;
  pdf_url: string | null;
  department: {
    id: number;
    name: string;
    short_name: string;
  };
  course: {
    id: number;
    name: string;
  };
  semester: {
    id: number;
    name: string;
  };
  exam_type: {
    id: number;
    name: string;
  };
  section?: string | null;
  user: {
    id: number;
    name: string;
    username?: string;
    student_id?: string;
  };
};

interface QuestionShowProps extends SharedData {
  question: Question;
}

export default function QuestionShow({ question }: QuestionShowProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track view after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.post(
        `/questions/${question.id}/view`,
        {},
        {
          preserveScroll: true,
          preserveState: true,
          only: [], // Don't reload any props
        }
      );
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [question.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("viewerContainer");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <MainLayout>
      <Head title={`${question.course.name} - Question`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/questions"
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Link>
        </div>

        {/* Question Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {question.course.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-3 py-1">
              <School className="h-3.5 w-3.5 mr-1" />
              {question.department.short_name} - {question.department.name}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1">
              <FileText className="h-3.5 w-3.5 mr-1" />
              {question.exam_type.name}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {question.semester.name}
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1">
              <Book className="h-3.5 w-3.5 mr-1" />
              {question.course.name}
            </Badge>
          </div>

          {question.pdf_url && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a
                  href={question.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-8">
            <div className="flex justify-end gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="text-xs"
              >
                <Maximize className="h-3.5 w-3.5 mr-1" />
                Fullscreen
              </Button>
            </div>

            <div
              id="viewerContainer"
              className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl relative"
            >
              {question.pdf_url ? (
                <object
                  data={question.pdf_url}
                  type="application/pdf"
                  className="w-full h-full min-h-[500px] md:min-h-[700px]"
                  title={question.course.name}
                >
                  <iframe
                    src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(question.pdf_url)}`}
                    width="100%"
                    height="100%"
                    className="min-h-[500px] md:min-h-[700px]"
                    title={question.course.name}
                  />
                </object>
              ) : (
                <div className="p-6 text-slate-600 dark:text-slate-300 text-sm">
                  PDF is not available.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Question Details
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                      Views
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-1">
                      <Eye className="h-3.5 w-3.5" />
                      {question.view_count}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                      File Size
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                      {formatFileSize(question.pdf_size)} MB
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3 col-span-2">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                      Uploaded
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(question.created_at)}
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Course Information
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <School className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Department
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {question.department.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Book className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Course
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {question.course.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Semester
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {question.semester.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Exam Type
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {question.exam_type.name}
                        </div>
                      </div>
                    </div>

                    {question.section && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Section
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {question.section}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploader Information */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Uploaded By
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {question.user.name}
                  </div>
                  {question.user.student_id && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {question.user.student_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
