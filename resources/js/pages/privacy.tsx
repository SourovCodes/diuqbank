import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
                <p className="mb-8 text-muted-foreground">Last updated: January 22, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p className="mt-4 text-muted-foreground">
                            Welcome to 3AG ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and
                            purchase our WordPress plugins and themes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
                        <p className="mt-4 text-muted-foreground">We collect information that you provide directly to us, including:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>Account Information:</strong> Name, email address, and password when you create an account.
                            </li>
                            <li>
                                <strong>Payment Information:</strong> Billing address and payment details processed securely through Stripe.
                            </li>
                            <li>
                                <strong>License Information:</strong> Domain names where you activate your licenses.
                            </li>
                            <li>
                                <strong>Communications:</strong> Information you provide when contacting our support team.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
                        <p className="mt-4 text-muted-foreground">We use the information we collect to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Process transactions and manage your subscriptions</li>
                            <li>Provide license keys and validate product activations</li>
                            <li>Send transactional emails (receipts, license keys, renewal reminders)</li>
                            <li>Provide customer support</li>
                            <li>Improve our products and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Information Sharing</h2>
                        <p className="mt-4 text-muted-foreground">
                            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>Payment Processors:</strong> Stripe processes all payments and stores payment information securely.
                            </li>
                            <li>
                                <strong>Service Providers:</strong> Trusted third parties who assist in operating our website and services.
                            </li>
                            <li>
                                <strong>Legal Requirements:</strong> When required by law or to protect our rights.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Data Security</h2>
                        <p className="mt-4 text-muted-foreground">
                            We implement appropriate technical and organizational security measures to protect your personal information. All data
                            transmission is encrypted using SSL/TLS. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Data Retention</h2>
                        <p className="mt-4 text-muted-foreground">
                            We retain your personal information for as long as your account is active or as needed to provide you services. We may
                            retain certain information as required by law or for legitimate business purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">7. Your Rights</h2>
                        <p className="mt-4 text-muted-foreground">You have the right to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Rectify inaccurate personal data</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to processing of your personal data</li>
                            <li>Data portability</li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">To exercise these rights, please contact us at the email address below.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">8. Cookies</h2>
                        <p className="mt-4 text-muted-foreground">
                            We use essential cookies to maintain your session and remember your preferences. We do not use third-party tracking
                            cookies or advertising cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
                        <p className="mt-4 text-muted-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
                            on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">10. Contact Us</h2>
                        <p className="mt-4 text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:support@3ag.dev" className="text-primary hover:underline">
                                support@3ag.dev
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
