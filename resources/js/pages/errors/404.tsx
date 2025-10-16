import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import { Head, Link } from '@inertiajs/react';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <MainLayout>
            <Head title="404 - Page Not Found" />

            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
                <div className="w-full max-w-2xl text-center">
                    {/* Error Code */}
                    <div className="mb-8">
                        <h1 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-9xl font-bold text-transparent dark:from-blue-400 dark:to-cyan-400">
                            404
                        </h1>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8 space-y-3">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Page Not Found
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Sorry, we couldn't find the page you're looking for. The page might have been moved or deleted.
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
                        <Button
                            asChild
                            size="lg"
                            className="min-w-[200px] rounded-full border border-slate-200 bg-white px-8 font-medium text-blue-600 shadow-md transition-all hover:border-blue-200 hover:bg-slate-50 hover:text-blue-700 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-blue-300"
                        >
                            <Link href="/questions" prefetch>
                                <Search className="mr-2 h-4 w-4" />
                                Browse Questions
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
