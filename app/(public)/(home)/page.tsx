import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Filter,
  BookOpen,
  Building2,
  FileText,
  Download,
  Medal,
  Users,
} from "lucide-react";
import { getStats } from "./stats";

// Features data
const features = [
  {
    title: "PDF Question Archive",
    description:
      "Access a comprehensive collection of previous exam question papers in PDF format from various departments and semesters.",
    icon: FileText,
  },
  {
    title: "Smart Filtering",
    description:
      "Find exactly what you need with our intuitive filtering system by semester, course, exam type, and more.",
    icon: Filter,
  },
  {
    title: "Contributor Recognition",
    description:
      "Get credit for your uploads with automatic watermarking on PDFs, recognizing your contribution to the community.",
    icon: Medal,
  },
];
export const revalidate = 3600; // invalidate every hour

export default async function Home() {
  // Fetch stats from database concurrently
  const { questionsCount, coursesCount, departmentsCount, contributorsCount } =
    await getStats();

  // Dynamic stats data
  const stats = [
    {
      value: `${questionsCount}+`,
      label: "PDF Questions",
      icon: FileText,
      color: "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600",
    },
    {
      value: `${coursesCount}+`,
      label: "Courses",
      icon: BookOpen,
      color: "from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600",
    },
    {
      value: `${departmentsCount}+`,
      label: "Departments",
      icon: Building2,
      color:
        "from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600",
    },
    {
      value: `${contributorsCount}+`,
      label: "Contributors",
      icon: Users,
      color:
        "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600",
    },
  ];

  return (
    <>
      {/* Hero section */}
      <section className="relative overflow-hidden pt-20 pb-40 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <Badge className="mb-5 px-3.5 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                DIU Question Bank
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  Share & Access
                </span>{" "}
                Exam Question PDFs
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                The ultimate platform to find, download, and share exam question
                papers. Upload your PDFs, help fellow students, and get
                recognized for your contributions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium"
                >
                  <Link href="/questions">
                    <Download className="mr-2 h-4 w-4" />
                    Find Question PDFs
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600 min-w-[200px] font-medium"
                >
                  <Link href="/questions/create">
                    <Upload className="mr-2 h-4 w-4" />
                    Share Question PDF
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden md:block w-full max-w-md mt-10 md:mt-0">
              <div className="relative h-[320px] w-full">
                <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/20 -z-10" />

                {/* PDF Card Visualization - Adjusted positioning and size */}
                <div className="relative bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-12">
                  <div className="absolute -top-8 -right-8 md:-top-10 md:-right-10">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                      <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="h-6 w-3/4 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-4 w-5/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-4 w-4/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>

                    <div className="grid grid-cols-3 gap-2 py-2">
                      <div className="h-8 w-full rounded-lg bg-blue-100 dark:bg-blue-900/50"></div>
                      <div className="h-8 w-full rounded-lg bg-green-100 dark:bg-green-900/50"></div>
                      <div className="h-8 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                      <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                    </div>

                    <div className="h-10 w-full rounded-lg bg-blue-500 dark:bg-blue-700 mt-4"></div>
                  </div>

                  {/* Watermark Visualization */}
                  <div className="absolute bottom-4 right-4 opacity-30 rotate-[-20deg] text-xs text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded px-2 py-1">
                    Contributed by User
                  </div>
                </div>

                {/* Floating elements - Adjusted position */}
                <div className="absolute bottom-0 -left-4 h-28 w-28 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-2">
                      <Download className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                    </div>
                    <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-3 w-5/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-3 w-3/4 rounded-full bg-blue-100 dark:bg-blue-900/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              How DIUQBank Works
            </h2>
            <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Upload PDF
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Share your exam questions by uploading the PDF file with
                  relevant details.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Medal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Get Credit
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Your contribution is recognized with your name watermarked on
                  the PDF.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Help Others
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Fellow students can easily find and download the question
                  papers they need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <div
                  className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20`}
                ></div>
                <div className="flex flex-col items-center text-center z-10 relative">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Empowering your academic success with comprehensive resources and
              tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
