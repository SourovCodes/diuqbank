import { Head, Link } from '@inertiajs/react';
import { Code, CreditCard, Globe, LayoutDashboard, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    return (
        <>
            <Head title="Home" />

            <div>
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
                                <span className="mr-2">🚀</span> Premium WordPress Plugins & Themes
                            </div>
                            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                Power Up Your <span className="text-primary">WordPress</span>
                            </h1>
                            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                                Premium plugins and themes to supercharge your WordPress site. WooCommerce extensions, developer tools, and beautiful
                                themes with automatic updates and priority support.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/products">
                                    <Button size="lg" className="w-full sm:w-auto">
                                        Browse Products
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                        Create Account
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
                            <h2 className="mb-4 text-3xl font-bold">Why Choose 3AG?</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Quality WordPress products with flexible licensing, automatic updates, and dedicated support.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Automatic Updates</CardTitle>
                                    <CardDescription>
                                        Get the latest features and security fixes delivered automatically. Your plugins and themes stay up to date.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Flexible Licensing</CardTitle>
                                    <CardDescription>
                                        Choose the plan that fits your needs. Single site, multi-site, or unlimited activations for agencies.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Simple Billing</CardTitle>
                                    <CardDescription>
                                        Flexible monthly or yearly subscriptions. Easily upgrade, downgrade, or cancel anytime from your dashboard.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <LayoutDashboard className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Customer Dashboard</CardTitle>
                                    <CardDescription>
                                        Manage your licenses, download products, view invoices, and control domain activations all in one place.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Quality Code</CardTitle>
                                    <CardDescription>
                                        Built following WordPress coding standards. Clean, well-documented code that works with your existing setup.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Code className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Priority Support</CardTitle>
                                    <CardDescription>
                                        Get help when you need it. Our team is ready to assist with installation, configuration, and troubleshooting.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Product Types Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold">Our Products</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Premium WordPress plugins and themes built to help you succeed online.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">WordPress Plugins</h3>
                                <p className="text-muted-foreground">
                                    WooCommerce extensions, performance boosters, SEO tools, and developer utilities.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <LayoutDashboard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">WordPress Themes</h3>
                                <p className="text-muted-foreground">
                                    Developer-friendly themes for agencies, portfolios, blogs, and eCommerce stores.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="rounded-2xl bg-primary p-8 text-center md:p-16">
                            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Get Started?</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
                                Browse our collection of premium WordPress plugins and themes. Create an account to manage your licenses and
                                downloads.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/products">
                                    <Button size="lg" variant="secondary">
                                        Browse Products
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
