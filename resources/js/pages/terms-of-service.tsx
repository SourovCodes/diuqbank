import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/layouts/main-layout";
import PageHeader from "@/components/page-header";
import { Head } from "@inertiajs/react";
import { FileText, Upload, Download, Shield, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfService() {
    return (
        <MainLayout>
            <Head title="Terms of Service" />

            <div className="container mx-auto px-4 py-16">
                <PageHeader
                    title="Terms of"
                    gradientText="Service"
                    description="Please read these terms carefully before using our platform"
                />

                {/* Last Updated */}
                <div className="mb-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Last Updated: October 11, 2025
                    </p>
                </div>

                {/* Agreement to Terms */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Agreement to Terms</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                Welcome to DIU Question Bank. These Terms of Service ("Terms") govern your access to and use of our platform. By accessing or using DIU Question Bank, you agree to be bound by these Terms.
                            </p>
                            <p>
                                If you do not agree to these Terms, you may not access or use the platform. We reserve the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of any changes.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Eligibility */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Eligibility</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>To use DIU Question Bank, you must:</p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Be a current or former student of Daffodil International University</li>
                                <li>Use a valid university email address for contributor access</li>
                                <li>Be at least 18 years old or have parental/guardian consent</li>
                                <li>Comply with all applicable laws and university policies</li>
                                <li>Provide accurate and truthful information</li>
                            </ul>
                            <p className="mt-4">
                                We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion if we believe you have violated these Terms.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* User Accounts and Responsibilities */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Accounts and Responsibilities</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 dark:text-slate-300">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Account Security</h3>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                    <li>You must notify us immediately of any unauthorized access or security breaches</li>
                                    <li>You are responsible for all activities that occur under your account</li>
                                    <li>Do not share your account with others</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Contributor Responsibilities</h3>
                                <p className="mb-2">As a contributor, you agree to:</p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>Upload only authentic exam question papers from DIU</li>
                                    <li>Ensure uploaded content does not violate copyright or intellectual property rights</li>
                                    <li>Provide accurate metadata (department, course, semester, exam type)</li>
                                    <li>Accept that your name will be watermarked on uploaded PDFs</li>
                                    <li>Not upload inappropriate, offensive, or irrelevant content</li>
                                    <li>Not upload content that violates university policies or academic integrity</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Usage and Access */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Usage and Access</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 dark:text-slate-300">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Permitted Use</h3>
                                <p className="mb-2">You may use DIU Question Bank to:</p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>Access and download question papers for personal academic preparation</li>
                                    <li>Study and practice using previous exam questions</li>
                                    <li>Contribute question papers to help the student community</li>
                                    <li>Share links to the platform with fellow students</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Prohibited Use</h3>
                                <p className="mb-2">You may NOT:</p>
                                <ul className="list-disc space-y-2 pl-5">
                                    <li>Commercially exploit or resell content from the platform</li>
                                    <li>Remove watermarks or contributor attribution from PDFs</li>
                                    <li>Use automated tools to scrape or mass-download content</li>
                                    <li>Attempt to hack, disrupt, or compromise the platform's security</li>
                                    <li>Upload malicious files, viruses, or harmful content</li>
                                    <li>Impersonate others or provide false information</li>
                                    <li>Use the platform for any illegal purposes</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Intellectual Property */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Scale className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Intellectual Property</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                <span className="font-medium">Platform Content:</span> The platform's design, features, code, and branding are owned by DIU Question Bank and are protected by intellectual property laws.
                            </p>
                            <p>
                                <span className="font-medium">User-Uploaded Content:</span> Question papers are created by Daffodil International University faculty and are intended for educational use. By uploading content, you confirm that:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>You obtained the question paper through legitimate means (completing the exam)</li>
                                <li>Your upload is for educational purposes only</li>
                                <li>You grant us a non-exclusive license to display and distribute the content on the platform</li>
                                <li>You understand your contribution will be publicly accessible with your name as attribution</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Disclaimer and Limitations */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disclaimer and Limitations</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                <span className="font-medium">No Warranty:</span> DIU Question Bank is provided "as is" without warranties of any kind. We do not guarantee:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>The accuracy, completeness, or authenticity of uploaded content</li>
                                <li>Uninterrupted or error-free service</li>
                                <li>That all uploaded materials will remain available indefinitely</li>
                                <li>Specific exam questions will appear in future exams</li>
                            </ul>
                            <p className="mt-4">
                                <span className="font-medium">Limitation of Liability:</span> We are not liable for any damages arising from your use of the platform, including but not limited to academic performance, data loss, or technical issues.
                            </p>
                            <p className="mt-4">
                                <span className="font-medium">Educational Purpose:</span> This platform is for study and preparation purposes only. It does not replace proper coursework, lectures, or official study materials.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Moderation */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Moderation</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>We reserve the right to:</p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Review and moderate all uploaded content</li>
                                <li>Remove content that violates these Terms or is deemed inappropriate</li>
                                <li>Suspend or terminate accounts that violate our policies</li>
                                <li>Edit or correct metadata for uploaded content</li>
                                <li>Cooperate with university administration regarding policy violations</li>
                            </ul>
                            <p className="mt-4">
                                If you believe content on the platform violates these Terms or infringes on rights, please contact us immediately.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Termination */}
                <Card className="mb-8 overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <div className="mb-4 flex items-center">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Termination</h2>
                        </div>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                You may stop using the platform at any time. To delete your account and remove your personal information, please contact us.
                            </p>
                            <p>
                                We may suspend or terminate your access immediately, without notice, for any violation of these Terms, including but not limited to:
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Uploading inappropriate or harmful content</li>
                                <li>Attempting to compromise platform security</li>
                                <li>Violating academic integrity or university policies</li>
                                <li>Misusing or abusing the platform</li>
                                <li>Providing false information</li>
                            </ul>
                            <p className="mt-4">
                                Upon termination, your right to access and use the platform will immediately cease, but your uploaded contributions may remain with attribution unless you request removal.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="overflow-hidden border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h2>

                        <div className="space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                If you have questions about these Terms of Service, please contact us:
                            </p>
                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="font-medium text-slate-900 dark:text-white">DIU Question Bank Team</p>
                                <p className="mt-2">Email: support@diuqbank.edu</p>
                                <p>Daffodil International University</p>
                            </div>
                            <p className="mt-4 text-sm italic">
                                By using DIU Question Bank, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
