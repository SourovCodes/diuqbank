import { Card, CardContent } from "@/components/ui/card";
import { GoogleLoginButton } from "./google-login-button";
import { AlertCircle, Shield, Users } from "lucide-react";

export interface SearchParams {
    error?: string;
    callbackUrl?: string;
}
interface PageProps {
    searchParams: Promise<SearchParams>;
}

// Error message mapping for better user experience
const getErrorMessage = (error: string) => {
    switch (error) {
        case "OAuthSignInError":
            return "There was a problem signing in with Google. Please try again.";
        case "OAuthCallbackError":
            return "Authentication failed. Please check your connection and try again.";
        case "AccessDenied":
            return "Access was denied. Please make sure you have the necessary permissions.";
        case "Configuration":
            return "There's a configuration issue. Please contact support.";
        default:
            return "An unexpected error occurred during sign in. Please try again.";
    }
};

export default async function LoginPage({ searchParams }: PageProps) {
    const { error, callbackUrl } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Header section */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">D</span>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                        Welcome to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                            DIUQBank
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                        Your gateway to exam success
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Sign in to access previous year questions and contribute to the community
                    </p>
                </div>

                {/* Login Card */}
                <Card className="overflow-hidden bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur">
                    <CardContent className="p-6 sm:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium mb-1">Sign in failed</p>
                                    <p>{getErrorMessage(error)}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <GoogleLoginButton callbackUrl={callbackUrl ?? "/"} />

                            {/* Features section */}
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-900 dark:text-white mb-4 text-center">
                                    Why join DIUQBank?
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                Secure Access
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Your data is protected with industry-standard security
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30">
                                        <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                Community Driven
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                Join thousands of students helping each other succeed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        By signing in, you agree to our{" "}
                        <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}