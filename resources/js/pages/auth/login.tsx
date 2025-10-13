import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { Head, Link } from '@inertiajs/react';

export default function Login() {
    return (
        <MainLayout>
            <Head title="Sign In" />

            <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
                <Card className="w-full max-w-md overflow-hidden border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <CardContent className="p-8">
                        {/* Logo/Title Section */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                                Welcome to <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">DIUQBank</span>
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to access your account</p>
                        </div>

                        {/* Google Sign In Button */}
                        <div className="space-y-4">
                            <a href="/auth/google">
                                <Button className="w-full bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" size="lg">
                                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </a>
                        </div>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="px-4 text-xs text-slate-500 dark:text-slate-400">Quick & Secure</span>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3 text-center text-sm text-slate-600 dark:text-slate-400">
                            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
                            <p>
                                Need help?{' '}
                                <Link href="/contact" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                                    Contact us
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
