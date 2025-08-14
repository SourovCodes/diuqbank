import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicQuestion, incrementViewCount } from "../actions";
import { PDFViewer } from "./components/pdf-viewer";
import { QuestionHeader } from "./components/question-header";

export async function generateMetadata({
  params,
}: QuestionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const questionId = parseInt(id, 10);

  if (isNaN(questionId)) {
    return {
      title: "Question Not Found",
    };
  }

  const result = await getPublicQuestion(questionId);

  if (!result.success) {
    return {
      title: "Question Not Found",
    };
  }

  const question = result.data!;

  return {
    title: `${question.courseName} - ${question.departmentShortName}`,
    description: `${question.examTypeName} exam question paper for ${question.courseName} from ${question.departmentName} department, ${question.semesterName}.`,
  };
}

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function QuestionDetailContent({ params }: QuestionDetailPageProps) {
  const { id } = await params;
  const questionId = parseInt(id, 10);

  if (isNaN(questionId)) {
    notFound();
  }

  const result = await getPublicQuestion(questionId);

  if (!result.success) {
    notFound();
  }

  const question = result.data!;

  // Increment view count (fire and forget)
  incrementViewCount(questionId).catch(console.error);

  const pdfUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${question.pdfKey}`;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-4 md:space-y-6">
        {/* Question Header */}
        <QuestionHeader question={question} pdfUrl={pdfUrl} />
      </div>

      {/* PDF Viewer Section */}
      <div className="space-y-4 md:space-y-6">
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Subtle gradient overlay for modern look */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 opacity-50 -z-10"></div>
          {/* Decorative accent circle */}
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-100/40 dark:bg-blue-900/10 -z-10"></div>

          <div className="p-6 md:p-8 relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
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
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Question Paper
              </h2>
            </div>
            <PDFViewer url={pdfUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function QuestionDetailPage(
  props: QuestionDetailPageProps
) {
  return (
    <div className="container mx-auto px-4 py-16">
      <QuestionDetailContent {...props} />
    </div>
  );
}
