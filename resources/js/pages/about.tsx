import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/layouts/main-layout";
import { Head } from "@inertiajs/react";
import { BookOpen, Upload, Users, GraduationCap } from "lucide-react";

export default function About() {
    return (
        <MainLayout>
            <Head title="About Us" />

            <div className="container mx-auto px-4 py-16">
                {/* Header section */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
                        About{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                            DIU Question Bank
                        </span>
                    </h1>
                    <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                    <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-300">
                        A community-driven platform helping students excel in their exams through shared knowledge
                    </p>
                </div>

                {/* Introduction section */}
                <Card className="mb-10 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What We Do</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                DIU Question Bank is a community-driven platform designed to help students at Daffodil International University prepare for their exams more effectively. We provide a centralized repository where students can access previous semester question papers, allowing them to understand exam patterns and practice thoroughly.
                            </p>
                            <p>
                                Our platform thrives on collaboration. Students who have completed their exams contribute by uploading question papers, building a comprehensive resource that benefits the entire university community. Every contribution helps future students succeed in their academic journey.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* How It Works section */}
                <div className="mb-10 grid gap-8 md:grid-cols-2">
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">For Contributors</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Students who have completed their exams can contribute to the platform by:</p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>
                                        <span className="font-medium">Signing in with university email:</span> Access the upload feature using your official DIU email address.
                                    </li>
                                    <li>
                                        <span className="font-medium">Uploading question papers:</span> Share question papers from your exams as PDF files, properly categorized by department, course, semester, and exam type.
                                    </li>
                                    <li>
                                        <span className="font-medium">Recognition for contribution:</span> Your name gets automatically watermarked on the uploaded PDF, acknowledging your valuable contribution to the community.
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">For Students</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>
                                    Anyone can access the question bank without logging in, making it easy for all students to prepare for their exams. The platform offers:
                                </p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>
                                        <span className="font-medium">Free access:</span> Browse and download question papers without any registration required.
                                    </li>
                                    <li>
                                        <span className="font-medium">Smart filtering:</span> Easily find relevant questions by filtering by department, semester, course, and exam type.
                                    </li>
                                    <li>
                                        <span className="font-medium">Comprehensive coverage:</span> Access a growing collection of question papers covering multiple semesters and courses.
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Our Mission section */}
                <Card className="mb-10 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                Our mission is to create a supportive academic environment where knowledge is shared freely and students help each other succeed. By providing easy access to previous exam questions, we enable students to:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Understand exam patterns and question formats</li>
                                <li>Practice with real exam questions from previous semesters</li>
                                <li>Identify important topics and focus areas</li>
                                <li>Prepare more effectively for upcoming exams</li>
                                <li>Build confidence through comprehensive preparation</li>
                            </ul>
                            <p>
                                Together, we're building a culture of collaboration and mutual support that helps every student at Daffodil International University achieve their academic goals.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Join Us section */}
                <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <h2 className="mb-4 text-center text-2xl font-bold text-slate-900 dark:text-white">
                            Be Part of the Community
                        </h2>

                        <div className="mx-auto max-w-2xl space-y-4 text-center text-slate-600 dark:text-slate-300">
                            <p>
                                Whether you're preparing for your next exam or have just completed one, you're a valuable part of our community. 
                                Access resources to help you study, and consider contributing your exam papers to help fellow students in their journey.
                            </p>
                            <p className="font-medium text-blue-600 dark:text-blue-400">
                                Together, we make learning easier for everyone at DIU.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
