import { Link } from '@inertiajs/react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="8" fill="currentColor" />
                                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xl font-bold">3AG</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">Premium WordPress plugins and themes to power your website.</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Products</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Features
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Account</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/40 pt-8">
                    <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} 3AG. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
