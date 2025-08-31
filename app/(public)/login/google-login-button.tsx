"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";

interface GoogleLoginButtonProps {
    callbackUrl: string;
}

export function GoogleLoginButton({ callbackUrl }: GoogleLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Show loading toast
            toast.loading("Connecting to Google...", {
                id: "google-signin",
            });

            await authClient.signIn.social({
                provider: "google",
                callbackURL: callbackUrl,
            });

            // Success toast
            toast.success("Successfully signed in!", {
                id: "google-signin",
                icon: <CheckCircle className="h-4 w-4" />,
            });

        } catch (error) {
            console.error("Google sign-in error:", error);

            let errorMessage = "Failed to sign in with Google. Please try again.";

            // Handle specific error types
            if (error instanceof Error) {
                if (error.message.includes("popup")) {
                    errorMessage = "Sign-in popup was blocked or closed. Please try again and allow popups.";
                } else if (error.message.includes("network")) {
                    errorMessage = "Network error. Please check your connection and try again.";
                } else if (error.message.includes("unauthorized")) {
                    errorMessage = "Unauthorized access. Please contact support if this persists.";
                }
            }

            setError(errorMessage);

            // Error toast
            toast.error(errorMessage, {
                id: "google-signin",
                icon: <AlertCircle className="h-4 w-4" />,
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <div className="h-5 w-5 border-2 border-t-transparent border-slate-600 dark:border-slate-300 animate-spin rounded-full" />
                        <span>Signing in...</span>
                    </>
                ) : (
                    <>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                        >
                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                <path
                                    fill="#4285F4"
                                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                                />
                            </g>
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                    </>
                )}
            </Button>

            {/* Inline error display */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Sign-in Error</p>
                        <p className="text-xs mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Secure sign-in powered by Google OAuth 2.0
                </p>
            </div>
        </div>
    );
}