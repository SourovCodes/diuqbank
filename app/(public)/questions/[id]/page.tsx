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
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Question Paper
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
    <div className="container mx-auto px-4 py-16">
      <QuestionDetailContent {...props} />
    </div>
  );
}
