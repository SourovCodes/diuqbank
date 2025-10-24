import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import questionsRoutes from '@/routes/questions';
import type { SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Building2, Download, FileText, Filter, Medal, Upload, Users } from 'lucide-react';

// Features data
const features = [
    {
        title: 'PDF Question Archive',
        description: 'Access a comprehensive collection of previous exam question papers in PDF format from various departments and semesters.',
        icon: FileText,
    },
    {
        title: 'Smart Filtering',
        description: 'Find exactly what you need with our intuitive filtering system by semester, course, exam type, and more.',
        icon: Filter,
    },
    {
        title: 'Contributor Recognition',
        description: 'Get credit for your uploads with automatic watermarking on PDFs, recognizing your contribution to the community.',
        icon: Medal,
    },
];

interface WelcomeProps extends SharedData {
    questionsCount: number;
    coursesCount: number;
    departmentsCount: number;
    contributorsCount: number;
}

export default function Welcome({ questionsCount, coursesCount, departmentsCount, contributorsCount }: WelcomeProps) {
    // Dynamic stats data
    const stats = [
        {
            value: `${questionsCount}+`,
            label: 'PDF Questions',
            icon: FileText,
            color: 'from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600',
        },
        {
            value: `${coursesCount}`,
            label: 'Courses',
            icon: BookOpen,
            color: 'from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600',
        },
        {
            value: `${departmentsCount}+`,
            label: 'Departments',
            icon: Building2,
            color: 'from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600',
        },
        {
            value: `${contributorsCount}+`,
            label: 'Contributors',
            icon: Users,
            color: 'from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600',
        },
    ];

    return (
        <MainLayout>
            <Head title="Home" />
            {/* Hero section */}
            <section className="relative overflow-hidden pt-20 pb-40 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
                        <div className="max-w-2xl">
                            <Badge className="mb-5 bg-blue-100 px-3.5 py-1.5 text-sm text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">
                                DIUQBank
                            </Badge>

                            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                                    Share & Access
                                </span>{' '}
                                Exam Question PDFs
                            </h1>

                            <p className="mb-8 text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300">
                                The ultimate platform to find, download, and share exam question papers. Upload your PDFs, help fellow students, and
                                get recognized for your contributions.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="min-w-[200px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                                >
                                    <Link href={questionsRoutes.index.url()} prefetch>
                                        <Download className="mr-2 h-4 w-4" />
                                        Find Question PDFs
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    size="lg"
                                    className="min-w-[200px] rounded-full border border-slate-200 bg-white px-8 font-medium text-blue-600 shadow-md transition-all hover:border-blue-200 hover:bg-slate-50 hover:text-blue-700 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-blue-300"
                                >
                                    <Link href="/questions/create" prefetch>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Share Question PDF
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-10 hidden w-full max-w-md md:mt-0 md:block">
                            <div className="relative h-[320px] w-full">
                                <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/20" />

                                {/* PDF Card Visualization - Adjusted positioning and size */}
                                <div className="relative mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                    <div className="absolute -top-8 -right-8 md:-top-10 md:-right-10">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg md:h-20 md:w-20">
                                            <FileText className="h-8 w-8 text-white md:h-10 md:w-10" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6">
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

                                        <div className="mt-4 h-10 w-full rounded-lg bg-blue-500 dark:bg-blue-700"></div>
                                    </div>

                                    {/* Watermark Visualization */}
                                    <div className="absolute right-4 bottom-4 rotate-[-20deg] rounded border border-blue-200 px-2 py-1 text-xs font-medium text-blue-600 opacity-30 dark:border-blue-800 dark:text-blue-400">
                                        Contributed by User
                                    </div>
                                </div>

                                {/* Floating elements - Adjusted position */}
                                <div className="absolute bottom-0 -left-4 h-28 w-28 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                    <div className="flex h-full flex-col justify-between">
                                        <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
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
            <section className="bg-gradient-to-b from-white to-slate-50 py-16 dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">How DIUQBank Works</h2>
                        <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300"></div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white dark:bg-blue-700">
                                1
                            </div>
                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Upload PDF</h3>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    Share your exam questions by uploading the PDF file with relevant details.
                                </p>
                            </div>
                        </div>

                        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white dark:bg-blue-700">
                                2
                            </div>
                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Medal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Get Credit</h3>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    Your contribution is recognized with your name watermarked on the PDF.
                                </p>
                            </div>
                        </div>

                        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white dark:bg-blue-700">
                                3
                            </div>
                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Help Others</h3>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    Fellow students can easily find and download the question papers they need.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats section */}
            <section className="relative py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div
                                    className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20`}
                                ></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.color} mb-4 flex items-center justify-center`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
                        <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300"></div>
                        <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-300">
                            Empowering your academic success with comprehensive resources and tools
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
