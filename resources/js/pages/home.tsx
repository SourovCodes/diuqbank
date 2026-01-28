import { Head, Link } from '@inertiajs/react';
import { BookOpen, Download, FileText, Filter, GraduationCap, Search, Upload, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    return (
        <>
            <Head title="DIU Question Bank" />

            <div>
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
                                <span className="mr-2">📚</span> Daffodil International University
                            </div>
                            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                DIU <span className="text-primary">Question Bank</span>
                            </h1>
                            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                                Access past exam questions from all departments and courses. Study smarter with our comprehensive collection of
                                previous year questions organized by semester and exam type.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/questions">
                                    <Button size="lg" className="w-full sm:w-auto">
                                        <Search className="mr-2 h-4 w-4" />
                                        Browse Questions
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Contribute Questions
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-muted/30 py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold">Why Use DIU Question Bank?</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Everything you need to prepare for your exams. Access, contribute, and study with past questions.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Extensive Collection</CardTitle>
                                    <CardDescription>
                                        Access thousands of past exam questions from all departments, courses, and semesters at DIU.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Filter className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Smart Filtering</CardTitle>
                                    <CardDescription>
                                        Filter questions by department, course, semester, and exam type to find exactly what you need.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <Download className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Easy Downloads</CardTitle>
                                    <CardDescription>Download question papers in PDF format for offline studying and printing.</CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Community Driven</CardTitle>
                                    <CardDescription>
                                        Students can contribute by uploading question papers to help fellow students succeed.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <CardTitle>All Departments</CardTitle>
                                    <CardDescription>
                                        Questions from CSE, EEE, BBA, English, Law, Pharmacy, and all other departments at DIU.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Verified Content</CardTitle>
                                    <CardDescription>
                                        All submissions are reviewed to ensure quality and accuracy of the question papers.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">Getting started with DIU Question Bank is simple and free.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">1. Search Questions</h3>
                                <p className="text-muted-foreground">
                                    Browse or filter questions by your department, course, semester, and exam type.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">2. Download & Study</h3>
                                <p className="text-muted-foreground">Download the question papers and use them to prepare for your upcoming exams.</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                                    <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">3. Contribute Back</h3>
                                <p className="text-muted-foreground">Help other students by uploading question papers you have from your exams.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="rounded-2xl bg-primary p-8 text-center md:p-16">
                            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Ace Your Exams?</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
                                Start exploring our collection of past exam questions. Create an account to contribute and help your fellow students
                                succeed.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/questions">
                                    <Button size="lg" variant="secondary">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Browse Questions
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                    >
                                        Create Account
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
