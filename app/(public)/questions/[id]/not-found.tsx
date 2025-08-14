import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileX, ArrowLeft, Home } from "lucide-react";

export default function QuestionNotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <FileX className="h-12 w-12 text-slate-400" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Question Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            The question you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <Link href="/questions" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Questions
            </Link>
          </Button>
          
          <Button
            variant="outline"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
