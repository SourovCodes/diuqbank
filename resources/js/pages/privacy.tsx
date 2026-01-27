import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
                <p className="mb-8 text-muted-foreground">Last updated: January 27, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p className="mt-4 text-muted-foreground">
                            Welcome to DIU Question Bank ("we," "our," or "us"). We are committed to protecting your personal information and your
                            right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
                            our platform to access and share past exam questions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
                        <p className="mt-4 text-muted-foreground">We collect information that you provide directly to us, including:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>Account Information:</strong> Name, email address, username, student ID, and password when you create an
                                account.
                            </li>
                            <li>
                                <strong>Profile Information:</strong> Optional profile picture and other details you choose to add.
                            </li>
                            <li>
                                <strong>Submissions:</strong> Question papers and related metadata (department, course, semester, exam type) that you
                                upload.
                            </li>
                            <li>
                                <strong>Activity Data:</strong> Votes, views, and interactions with the platform.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
                        <p className="mt-4 text-muted-foreground">We use the information we collect to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Create and manage your account</li>
                            <li>Display your contributions to the community</li>
                            <li>Show contributor statistics and leaderboards</li>
                            <li>Send important notifications about your submissions</li>
                            <li>Improve the platform and user experience</li>
                            <li>Prevent abuse and ensure platform integrity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Information Visibility</h2>
                        <p className="mt-4 text-muted-foreground">Please be aware that certain information is visible to other users:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>Public Information:</strong> Your name, username, profile picture, and submission history are visible to all
                                users.
                            </li>
                            <li>
                                <strong>Private Information:</strong> Your email address, student ID, and password are never shared publicly.
                            </li>
                            <li>
                                <strong>Contributor Stats:</strong> Your submission count, vote count, and view count are displayed on your profile.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Data Security</h2>
                        <p className="mt-4 text-muted-foreground">
                            We implement appropriate technical and organizational security measures to protect your personal information. Passwords
                            are hashed using industry-standard algorithms, and all data transmission is encrypted using SSL/TLS. However, no method
                            of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Data Retention</h2>
                        <p className="mt-4 text-muted-foreground">
                            We retain your personal information for as long as your account is active. Submitted question papers remain on the
                            platform to benefit future students unless removed by administrators. You may request deletion of your account and
                            personal data at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">7. Your Rights</h2>
                        <p className="mt-4 text-muted-foreground">You have the right to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate personal data</li>
                            <li>Request deletion of your account</li>
                            <li>Download your submitted content</li>
                            <li>Opt out of non-essential communications</li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">To exercise these rights, please contact us using the information below.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">8. Cookies</h2>
                        <p className="mt-4 text-muted-foreground">
                            We use essential cookies to maintain your session and remember your preferences (such as dark/light mode). We do not use
                            third-party tracking cookies or advertising cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">9. Third-Party Services</h2>
                        <p className="mt-4 text-muted-foreground">
                            We may use third-party services for hosting, analytics, and email delivery. These services have their own privacy
                            policies, and we encourage you to review them. We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
                        <p className="mt-4 text-muted-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
                            on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">11. Contact Us</h2>
                        <p className="mt-4 text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:support@diuqbank.com" className="text-primary hover:underline">
                                support@diuqbank.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
