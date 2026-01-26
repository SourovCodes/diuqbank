import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service" />

            <div className="container mx-auto max-w-4xl px-4 py-16">
                <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
                <p className="mb-8 text-muted-foreground">Last updated: January 22, 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
                        <p className="mt-4 text-muted-foreground">
                            By accessing or using 3AG's website and purchasing our WordPress plugins and themes, you agree to be bound by these Terms
                            of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Products and Licenses</h2>
                        <p className="mt-4 text-muted-foreground">
                            When you purchase a product from 3AG, you receive a license to use the WordPress plugin or theme according to the terms of
                            your subscription plan.
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>License Scope:</strong> Each license is valid for the number of domains specified in your plan (e.g., 1-site,
                                5-site, or unlimited).
                            </li>
                            <li>
                                <strong>License Duration:</strong> Licenses are valid for the duration of your active subscription.
                            </li>
                            <li>
                                <strong>Updates and Support:</strong> Active subscriptions include access to product updates and support.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. Subscription and Billing</h2>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>
                                <strong>Recurring Billing:</strong> Subscriptions are billed on a recurring basis (monthly or yearly) until cancelled.
                            </li>
                            <li>
                                <strong>Price Changes:</strong> We reserve the right to change prices. You will be notified of any price changes
                                before your next billing cycle.
                            </li>
                            <li>
                                <strong>Payment Processing:</strong> All payments are processed securely through Stripe.
                            </li>
                            <li>
                                <strong>Failed Payments:</strong> If a payment fails, we will attempt to charge your card again. After multiple failed
                                attempts, your subscription may be suspended.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Refund Policy</h2>
                        <p className="mt-4 text-muted-foreground">
                            We offer a 14-day money-back guarantee on all new subscriptions. If you are not satisfied with your purchase, contact us
                            within 14 days of your initial purchase for a full refund.
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Refunds are only available for the initial purchase, not for subscription renewals.</li>
                            <li>To request a refund, contact our support team with your order details.</li>
                            <li>Refunds are processed within 5-10 business days.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Cancellation</h2>
                        <p className="mt-4 text-muted-foreground">
                            You may cancel your subscription at any time from your dashboard. Upon cancellation:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Your subscription will remain active until the end of your current billing period.</li>
                            <li>You will retain access to products downloaded during your subscription.</li>
                            <li>You will no longer receive updates or support after your subscription ends.</li>
                            <li>License activations will be deactivated when your subscription expires.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Acceptable Use</h2>
                        <p className="mt-4 text-muted-foreground">You agree not to:</p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Redistribute, resell, or share your license keys with others</li>
                            <li>Use our products for any illegal or unauthorized purpose</li>
                            <li>Attempt to bypass license validation or activation limits</li>
                            <li>Remove or modify any proprietary notices from our products</li>
                            <li>Use our products in a way that could damage or impair our services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
                        <p className="mt-4 text-muted-foreground">
                            All products, including WordPress plugins and themes, are the intellectual property of 3AG. Your license grants you the
                            right to use the products but does not transfer ownership. You may not copy, modify, distribute, or create derivative
                            works without our express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">8. Support</h2>
                        <p className="mt-4 text-muted-foreground">
                            Support is provided to active subscribers through our support channels. We will make reasonable efforts to respond to
                            support requests in a timely manner, but response times are not guaranteed. Support covers:
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                            <li>Installation and configuration assistance</li>
                            <li>Bug reports and technical issues</li>
                            <li>General usage questions</li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">
                            Support does not include customization, third-party integrations, or general WordPress support.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
                        <p className="mt-4 text-muted-foreground">
                            To the maximum extent permitted by law, 3AG shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages resulting from your use of our products or services. Our total liability shall not exceed the amount you
                            paid for the product in the 12 months prior to the claim.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">10. Warranty Disclaimer</h2>
                        <p className="mt-4 text-muted-foreground">
                            Our products are provided "as is" without warranty of any kind. We do not guarantee that our products will be error-free,
                            uninterrupted, or compatible with all WordPress configurations or third-party plugins.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
                        <p className="mt-4 text-muted-foreground">
                            We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by posting a
                            notice on our website or sending an email. Continued use of our services after changes constitutes acceptance of the new
                            terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">12. Governing Law</h2>
                        <p className="mt-4 text-muted-foreground">
                            These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict
                            of law principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">13. Contact Us</h2>
                        <p className="mt-4 text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us at{' '}
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
