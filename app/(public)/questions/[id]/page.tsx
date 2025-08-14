import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicQuestion, incrementViewCount } from "../actions";
import { PDFViewer } from "./components/pdf-viewer";
import { QuestionHeader } from "./components/question-header";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="h-9 px-4">
            <Link href="/questions" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Questions
            </Link>
          </Button>
        </div>

        {/* Question Header */}
        <QuestionHeader question={question} pdfUrl={pdfUrl} />
      </div>

      {/* PDF Viewer Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Question Paper
        </h2>

        <PDFViewer url={pdfUrl} />
      </div>
    </div>
  );
}

export default async function QuestionDetailPage(
  props: QuestionDetailPageProps
) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <QuestionDetailContent {...props} />
    </div>
  );
}
