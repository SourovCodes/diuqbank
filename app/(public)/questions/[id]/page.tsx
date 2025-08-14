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
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 md:p-6 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 md:mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Question
            </span>{" "}
            Paper
          </h2>

          <PDFViewer url={pdfUrl} />
        </div>
      </div>
    </div>
  );
}

export default async function QuestionDetailPage(
  props: QuestionDetailPageProps
) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <QuestionDetailContent {...props} />
      </div>
    </div>
  );
}
