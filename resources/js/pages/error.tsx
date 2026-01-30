import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, ServerCrash, ShieldOff, WifiOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
    status: number;
}

const errorConfig: Record<number, { title: string; description: string; icon: typeof AlertTriangle }> = {
    400: {
        title: 'Bad Request',
        description: 'The request could not be understood. Please check your input and try again.',
        icon: AlertTriangle,
    },
    401: {
        title: 'Unauthorized',
        description: 'You need to be logged in to access this page.',
        icon: ShieldOff,
    },
    403: {
        title: 'Access Denied',
        description: "Sorry, you don't have permission to access this page.",
        icon: ShieldOff,
    },
    404: {
        title: 'Page Not Found',
        description: "Oops! The page you're looking for doesn't exist or has been moved.",
        icon: AlertTriangle,
    },
    405: {
        title: 'Method Not Allowed',
        description: 'The action you tried to perform is not supported for this page.',
        icon: ShieldOff,
    },
    419: {
        title: 'Page Expired',
        description: 'Your session has expired. Please refresh and try again.',
        icon: RefreshCw,
    },
    429: {
        title: 'Too Many Requests',
        description: "You've made too many requests. Please wait a moment and try again.",
        icon: WifiOff,
    },
    500: {
        title: 'Server Error',
        description: 'Something went wrong on our end. We are working to fix it.',
        icon: ServerCrash,
    },
    503: {
        title: 'Service Unavailable',
        description: "We're currently undergoing maintenance. Please check back soon.",
        icon: ServerCrash,
    },
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const config = errorConfig[status] ?? {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again.',
        icon: AlertTriangle,
    };

    const Icon = config.icon;

    return (
        <>
            <Head title={`${status} - ${config.title}`} />

            <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <Icon className="h-10 w-10 text-destructive" />
                    </div>

                    {/* Status Code */}
                    <p className="mb-2 text-6xl font-bold text-muted-foreground/50">{status}</p>

                    {/* Title */}
                    <h1 className="mb-3 text-2xl font-semibold">{config.title}</h1>

                    {/* Description */}
                    <p className="mb-8 text-muted-foreground">{config.description}</p>

                    {/* Actions */}
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                        <Link href="/">
                            <Button className="w-full sm:w-auto">
                                <Home className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    {/* Refresh option for certain errors */}
                    {[419, 500, 503].includes(status) && (
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Try refreshing the page
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
