import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import { Head, Link } from '@inertiajs/react';
import { Home, ShieldAlert } from 'lucide-react';

export default function Forbidden() {
    return (
        <MainLayout>
            <Head title="403 - Forbidden" />

            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
                <div className="w-full max-w-2xl text-center">
                    {/* Error Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                            <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Error Code */}
                    <div className="mb-6">
                        <h1 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-7xl font-bold text-transparent dark:from-red-400 dark:to-orange-400">
                            403
                        </h1>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8 space-y-3">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Access Forbidden
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="min-w-[200px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                        >
                            <Link href="/" prefetch>
                                <Home className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
