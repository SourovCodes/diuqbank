import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
                <p className="mb-8 text-muted-foreground">Last updated: January 27, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
                        <p className="mt-4 text-muted-foreground">
                            By accessing or using DIU Question Bank, you agree to be bound by these Terms of Service. If you do not agree to these
                            terms, please do not use our platform. This platform is designed for Daffodil International University students to share
                            and access past exam questions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Eligibility</h2>
                        <p className="mt-4 text-muted-foreground">
                            DIU Question Bank is intended for use by students and faculty of Daffodil International University. By creating an
                            account, you represent that:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>You are affiliated with Daffodil International University</li>
                            <li>You are at least 16 years of age</li>
                            <li>You will use the platform for legitimate educational purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. User Accounts</h2>
                        <p className="mt-4 text-muted-foreground">When creating an account, you agree to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Content Guidelines</h2>
                        <p className="mt-4 text-muted-foreground">When submitting question papers or other content, you agree that:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>The content is an authentic past exam question from DIU</li>
                            <li>You have the right to share this content for educational purposes</li>
                            <li>The content is properly categorized (correct department, course, semester, exam type)</li>
                            <li>The content does not contain copyrighted materials that you do not have permission to share</li>
                            <li>The content does not include any personal information of students or faculty</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Prohibited Conduct</h2>
                        <p className="mt-4 text-muted-foreground">You agree not to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Upload fake, misleading, or fabricated question papers</li>
                            <li>Share content that violates university policies or academic integrity guidelines</li>
                            <li>Impersonate other users or misrepresent your identity</li>
                            <li>Manipulate the voting system or engage in vote fraud</li>
                            <li>Use automated systems to access or interact with the platform</li>
                            <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
                            <li>Use the platform for any commercial purposes without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Content Moderation</h2>
                        <p className="mt-4 text-muted-foreground">
                            All submitted content is subject to review by our moderation team. We reserve the right to:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Approve, reject, or remove any submitted content</li>
                            <li>Edit content metadata for accuracy</li>
                            <li>Suspend or terminate accounts that violate these terms</li>
                            <li>Report illegal activities to appropriate authorities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
                        <p className="mt-4 text-muted-foreground">
                            Question papers are academic documents belonging to Daffodil International University. By using this platform, you
                            acknowledge that:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Content is shared for educational purposes only</li>
                            <li>Commercial use of downloaded content is prohibited</li>
                            <li>The platform does not claim ownership of submitted content</li>
                            <li>Contributors retain credit for their submissions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">8. Disclaimer</h2>
                        <p className="mt-4 text-muted-foreground">
                            DIU Question Bank is a community-driven platform. We make no guarantees regarding:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>The accuracy or authenticity of submitted question papers</li>
                            <li>The completeness of the question bank</li>
                            <li>The availability of questions for specific courses or semesters</li>
                            <li>Exam outcomes based on studying with our materials</li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">
                            This platform is a study aid and should be used alongside official course materials and resources provided by your
                            instructors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
                        <p className="mt-4 text-muted-foreground">
                            To the maximum extent permitted by law, DIU Question Bank and its operators shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages resulting from your use of the platform. This includes, but is
                            not limited to, any reliance on content accuracy for exam preparation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">10. Account Termination</h2>
                        <p className="mt-4 text-muted-foreground">
                            We reserve the right to suspend or terminate your account at any time for violations of these terms. You may also delete
                            your account at any time. Upon termination:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Your profile information will be removed</li>
                            <li>Your submitted content may remain on the platform to benefit other students</li>
                            <li>Attribution for your contributions may be anonymized</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
                        <p className="mt-4 text-muted-foreground">
                            We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by posting a
                            notice on our website. Continued use of the platform after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">12. Governing Law</h2>
                        <p className="mt-4 text-muted-foreground">
                            These Terms of Service shall be governed by and construed in accordance with the laws of Bangladesh, without regard to
                            conflict of law principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">13. Contact Us</h2>
                        <p className="mt-4 text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us at{' '}
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
