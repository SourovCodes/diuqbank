"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-16">
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </div>
                    </div>
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session) {
            const redirect = searchParams?.get("redirect") || "/questions";
            router.replace(redirect);
        }
    }, [session, router, searchParams]);

    const handleGoogleSignIn = useCallback(async () => {
        try {
            setIsSubmitting(true);
            const redirect = searchParams?.get("redirect") || undefined;
            const res = await signIn.social({ provider: "google", callbackURL: redirect });
            if (res.error) {
                toast.error("Sign in failed. Please try again. Inform admin if the problem persists.", { duration: 6000 });
                setIsSubmitting(false);
            }
        } catch {
            toast.error("Sign in failed. Please try again. Inform admin if the problem persists.", { duration: 6000 });
            setIsSubmitting(false);
        }
    }, [searchParams]);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Sign in to DIUQbank</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Use your Google account to continue</p>
                        </div>
                    </div>

                    <Button
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        type="button"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting to Google...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 533.5 544.3"
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95.1h147c-6.3 34.1-25 62.9-53.5 82.2l86.4 67c50.6-46.7 81.6-115.5 81.6-194.1z" />
                                    <path fill="#34A853" d="M272 544.3c73.8 0 135.8-24.5 181.1-66.7l-86.4-67c-24.1 16.2-55 25.9-94.7 25.9-72.7 0-134.3-49-156.4-114.9l-89.9 69.4C65.1 486.9 161.5 544.3 272 544.3z" />
                                    <path fill="#FBBC05" d="M115.6 321.6c-10.1-29.9-10.1-62.2 0-92.1l-89.9-69.4c-39.8 79.4-39.8 151.5 0 230.9l89.9-69.4z" />
                                    <path fill="#EA4335" d="M272 107.7c39.9-.6 77.8 14.8 106.8 42.8l79.6-79.6C411.1 24.6 342.1-.1 272 0 161.5 0 65.1 57.4 25.7 149.4l89.9 69.4C137.7 152.9 199.3 103.9 272 103.9z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <div className="flex items-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        You agree to our Terms and Privacy Policy by continuing.
                    </div>
                </div>
            </div>
        </div>
    );
}


