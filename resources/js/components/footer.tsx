import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">DIU QBank</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Access past exam questions from Daffodil International University. Study smarter with our comprehensive question bank.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    How It Works
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
                    <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} DIU Question Bank. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
