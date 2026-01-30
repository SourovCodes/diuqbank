import { Head } from '@inertiajs/react';
import { BookOpen, GraduationCap, Heart, Target, Users } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
    return (
        <>
            <Head title="About Us" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold">About DIU Question Bank</h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        A student-driven initiative to help Daffodil International University students prepare better for their exams by providing
                        access to past questions.
                    </p>
                </div>

                {/* Mission Section */}
                <section className="mb-16">
                    <div className="rounded-2xl border bg-card p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="mb-3 text-2xl font-semibold">Our Mission</h2>
                                <p className="text-muted-foreground">
                                    We believe that every student deserves access to quality study materials. DIU Question Bank was created to bridge
                                    the gap between students and past exam questions, making it easier for everyone to understand exam patterns, practice
                                    effectively, and excel in their academics.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="mb-16">
                    <h2 className="mb-8 text-center text-2xl font-semibold">What We Stand For</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Users className="h-6 w-6" />
                                </div>
                                <CardTitle>Community Driven</CardTitle>
                                <CardDescription>
                                    Built by students, for students. Our platform thrives on contributions from the DIU community.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <CardTitle>Academic Excellence</CardTitle>
                                <CardDescription>
                                    We aim to help students achieve their academic goals through better exam preparation resources.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <CardTitle>Free & Open</CardTitle>
                                <CardDescription>
                                    Access to education resources should be free. We keep the platform open for all DIU students.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="mb-16">
                    <h2 className="mb-8 text-center text-2xl font-semibold">How It Works</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold">Browse Questions</h3>
                                <p className="text-muted-foreground">
                                    Search and filter questions by department, course, semester, and exam type to find exactly what you need.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold">View & Download</h3>
                                <p className="text-muted-foreground">
                                    View question papers directly in your browser or download them for offline study sessions.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold">Contribute</h3>
                                <p className="text-muted-foreground">
                                    Have questions that aren&apos;t in our bank? Register and submit them to help fellow students.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                4
                            </div>
                            <div>
                                <h3 className="font-semibold">Vote & Verify</h3>
                                <p className="text-muted-foreground">
                                    Upvote quality submissions and help the community identify the most accurate and helpful resources.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="rounded-2xl bg-muted/50 p-8 text-center">
                    <h2 className="mb-4 text-2xl font-semibold">Join Our Community</h2>
                    <p className="mb-6 text-muted-foreground">
                        Whether you&apos;re looking for questions or want to contribute, we welcome you to be part of the DIU Question Bank community.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="/questions"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Browse Questions
                        </a>
                        <a
                            href="/register"
                            className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
                        >
                            Get Started
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
}
