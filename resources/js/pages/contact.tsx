import { Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Contact() {
    return (
        <>
            <Head title="Contact Us" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Have questions, suggestions, or need help? We&apos;d love to hear from you. Reach out to us through any of the channels below.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="mb-16 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Mail className="h-6 w-6" />
                            </div>
                            <CardTitle>Email Us</CardTitle>
                            <CardDescription>Send us an email and we&apos;ll get back to you within 24-48 hours.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <a href="mailto:sourov2305101004@diu.edu.bd" className="text-primary hover:underline">
                                sourov2305101004@diu.edu.bd
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <CardTitle>Community Support</CardTitle>
                            <CardDescription>Join our community for quick help from fellow students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <a href="https://facebook.com/groups/diuqbank" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Facebook Group
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <CardTitle>Location</CardTitle>
                            <CardDescription>We&apos;re based at Daffodil International University.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Daffodil International University
                                <br />
                                Ashulia, Savar
                                <br />
                                Dhaka, Bangladesh
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <CardTitle>Response Time</CardTitle>
                            <CardDescription>We aim to respond to all inquiries promptly.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Email: 24-48 hours
                                <br />
                                Facebook: Same day
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ Section */}
                <section className="mb-16">
                    <h2 className="mb-8 text-center text-2xl font-semibold">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="mb-2 font-semibold">How do I submit a question paper?</h3>
                            <p className="text-muted-foreground">
                                First, create an account or log in. Then navigate to the submission page and upload your question paper in PDF format.
                                Make sure to select the correct department, course, semester, and exam type.
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="mb-2 font-semibold">My submission was rejected. What should I do?</h3>
                            <p className="text-muted-foreground">
                                Submissions may be rejected if they are duplicates, low quality, or incorrectly categorized. Check the rejection reason
                                and feel free to resubmit with the necessary corrections.
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="mb-2 font-semibold">Can I download questions for offline use?</h3>
                            <p className="text-muted-foreground">
                                Yes! All question papers can be viewed directly in your browser and downloaded as PDF files for offline study.
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="mb-2 font-semibold">How can I report incorrect or inappropriate content?</h3>
                            <p className="text-muted-foreground">
                                Please email us at support@diuqbank.com with the details of the content you&apos;d like to report. Include the question
                                ID and a description of the issue.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Feedback Section */}
                <section className="rounded-2xl bg-muted/50 p-8 text-center">
                    <h2 className="mb-4 text-2xl font-semibold">Have Feedback?</h2>
                    <p className="mb-6 text-muted-foreground">
                        We&apos;re constantly working to improve DIU Question Bank. Your feedback helps us serve you better.
                    </p>
                    <a
                        href="mailto:feedback@diuqbank.com?subject=Feedback for DIU Question Bank"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Send Feedback
                    </a>
                </section>
            </div>
        </>
    );
}
