import PageHeader from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { Head } from '@inertiajs/react';
import { Database, Eye, FileText, Lock, Mail, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <MainLayout>
            <Head title="Privacy Policy" />

            <div className="container mx-auto px-4 py-16">
                <PageHeader
                    title="Privacy"
                    gradientText="Policy"
                    description="Your privacy matters to us. Learn how we collect, use, and protect your information."
                />

                {/* Last Updated */}
                <div className="mb-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Last Updated: October 11, 2025</p>
                </div>

                {/* Introduction */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Introduction</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                Welcome to DIUQBank. We are committed to protecting your privacy and ensuring the security of your personal
                                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
                                our platform.
                            </p>
                            <p>
                                By accessing or using DIUQBank, you agree to this Privacy Policy. If you do not agree with our policies and practices,
                                please do not use our platform.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Information We Collect */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Database className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Information We Collect</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 dark:text-slate-300">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h3>
                                <p className="mb-2">When you register as a contributor, we collect:</p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>University email address (for authentication and verification)</li>
                                    <li>Full name (displayed as contributor on uploaded materials)</li>
                                    <li>Student ID or university identification</li>
                                    <li>Department and academic information</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Uploaded Content</h3>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>Question papers uploaded as PDF files</li>
                                    <li>Metadata including department, course, semester, and exam type</li>
                                    <li>Upload timestamps and contributor information</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Usage Information</h3>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>Browser type and version</li>
                                    <li>Device information and operating system</li>
                                    <li>IP address and general location data</li>
                                    <li>Pages visited and time spent on the platform</li>
                                    <li>Search queries and filter preferences</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Your Information */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How We Use Your Information</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Authenticate and verify university students for contributor access</li>
                                <li>Display contributor names with watermarks on uploaded question papers</li>
                                <li>Organize and categorize question papers for easy access</li>
                                <li>Improve platform functionality and user experience</li>
                                <li>Analyze usage patterns to enhance our services</li>
                                <li>Prevent fraud, abuse, and unauthorized access</li>
                                <li>Communicate important updates about the platform</li>
                                <li>Respond to user inquiries and provide support</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Information Sharing */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Eye className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Information Sharing</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                We respect your privacy and do not sell, trade, or rent your personal information to third parties. However, we may
                                share information in the following circumstances:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    <span className="font-medium">Public Display:</span> Contributor names are displayed publicly on uploaded question
                                    papers as recognition for their contribution.
                                </li>
                                <li>
                                    <span className="font-medium">With Your Consent:</span> We may share information when you explicitly give us
                                    permission.
                                </li>
                                <li>
                                    <span className="font-medium">Legal Requirements:</span> When required by law or to protect our rights and safety.
                                </li>
                                <li>
                                    <span className="font-medium">University Administration:</span> When necessary to comply with university policies
                                    or handle academic integrity issues.
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Security */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Lock className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Security</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal information from
                                unauthorized access, disclosure, alteration, or destruction. These measures include:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Secure socket layer (SSL) encryption for data transmission</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication mechanisms</li>
                                <li>Secure storage of uploaded files</li>
                                <li>Regular backups to prevent data loss</li>
                            </ul>
                            <p className="mt-4">
                                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100%
                                secure. We cannot guarantee absolute security.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Your Rights */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Rights</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>You have the right to:</p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Access your personal information we hold</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your account and personal data</li>
                                <li>Object to or restrict certain processing activities</li>
                                <li>Withdraw consent for data processing at any time</li>
                                <li>Request a copy of your data in a portable format</li>
                            </ul>
                            <p className="mt-4">Note: Deleting your account will remove your uploaded contributions from the platform.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Us */}
                <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please
                                contact us:
                            </p>
                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="font-medium text-slate-900 dark:text-white">DIUQBank Team</p>
                                <p className="mt-2">Email: privacy@diuqbank.edu</p>
                                <p>Daffodil International University</p>
                            </div>
                            <p className="mt-4 text-sm">
                                We will respond to your inquiries within a reasonable timeframe and work to address your concerns.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
