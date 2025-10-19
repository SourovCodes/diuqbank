import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Code, DollarSign, Mail, Shield, Smartphone, Upload } from 'lucide-react';

export default function HelpDeveloper() {
    return (
        <MainLayout>
            <Head title="Help the Developer" />

            <div className="container mx-auto px-4 py-16">
                <PageHeader
                    title="Help the"
                    gradientText="Developer"
                    description="You can contribute to this beloved website in many ways and help make it better for everyone"
                />

                {/* Introduction */}
                <Card className="mb-10 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p className="text-lg">
                                DIUQBank is a community project built with love for students. Your contributions, whether big or small, help make this
                                platform better for everyone. Here are the ways you can help:
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Ways to Contribute */}
                <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Report Issues & Suggestions */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                    <AlertTriangle className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Issues</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Found a bug or have a suggestion to make DIUQBank better?</p>
                                <p className="text-sm">
                                    We value your feedback! Let us know about any issues you encounter or features you'd like to see. Your input helps
                                    us improve the platform for everyone.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact" prefetch>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Contact Us
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Frontend Development */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600">
                                    <Code className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Design the UI</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Are you a skilled frontend developer or designer?</p>
                                <p className="text-sm">
                                    We're always looking to improve our user interface and user experience. You can contribute UI designs in any way
                                    you like—<span className="font-semibold">Figma</span>, <span className="font-semibold">Adobe XD</span>, or even by
                                    building a webpage directly. If you can help make DIUQBank more beautiful and user-friendly, we'd love to hear
                                    from you!
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Tech Stack: React, TypeScript, Tailwind CSS (but Figma, XD, or any design method is welcome!)
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact" prefetch>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Get in Touch
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Load Testing & Security */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 dark:from-red-400 dark:to-red-600">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Testing</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Can you help us test and secure our platform?</p>
                                <p className="text-sm">
                                    We want to ensure DIUQBank is robust and secure. If you have experience with load testing or can perform DOS/DDoS
                                    testing, we welcome your help!
                                </p>
                                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Important: Please contact us beforehand so we can monitor resource usage during testing.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact" prefetch>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Coordinate Testing
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Android App Publishing */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 dark:from-green-400 dark:to-green-600">
                                    <Smartphone className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Publish Android App</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Have a Google Play Console account?</p>
                                <p className="text-sm">
                                    We've developed a Flutter app for DIUQBank but don't have a Google Play Console account. If you can publish our
                                    app on your console, we can offer compensation.
                                </p>
                                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        💰 We can pay for this service. Contact us to discuss details.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact" prefetch>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Discuss Publishing
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Questions */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Questions</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Notice any missing questions or discrepancies?</p>
                                <p className="text-sm">
                                    The best way to help is by contributing question papers! If you notice missing questions or any disparities in our
                                    database, please upload them or let us know.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/questions" prefetch>
                                        <Upload className="mr-2 h-4 w-4" />
                                        View Questions
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Support */}
                    <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="h-full p-8">
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-400 dark:to-orange-600">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Other Ways to Help</h2>
                            </div>

                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>Have another idea on how to contribute?</p>
                                <p className="text-sm">
                                    We're open to all forms of contribution! Whether it's spreading the word, providing resources, or any other form
                                    of support, we'd love to hear from you.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact" prefetch>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Reach Out
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Thank You Section */}
                <Card className="overflow-hidden border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md dark:border-slate-700 dark:from-blue-950/30 dark:to-cyan-950/30">
                    <CardContent className="p-8 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Thank You!</h2>
                        <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                            Every contribution, no matter how small, helps make DIUQBank better for students. Together, we're building a platform that
                            truly serves the community. Your support means the world to us! 💙
                        </p>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
