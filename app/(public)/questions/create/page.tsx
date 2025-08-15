import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QuestionForm } from "../components/question-form";

export const metadata: Metadata = {
  title: "Submit Question | DIU QBank",
  description: "Submit a new question paper to help fellow students",
};

export default async function CreateQuestionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/questions/create");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Submit{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Question
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Help fellow students by sharing question papers. Your contributions
          make exam preparation easier for everyone in the DIU community.
        </p>
      </div>

      <QuestionForm />
    </div>
  );
}
