import { Button } from '@/components/ui/button';
import { Mail, Megaphone } from 'lucide-react';

export default function AffiliateBanner() {
    return (
        <div className="group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg transition-all hover:shadow-2xl md:p-8 dark:border-blue-700 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

            {/* Decorative megaphone icon */}
            <div className="absolute -top-6 -right-6 h-32 w-32 rotate-12 opacity-10 transition-transform duration-700 group-hover:rotate-45 dark:opacity-20">
                <Megaphone className="h-full w-full text-blue-600 dark:text-blue-400" />
            </div>

            <div className="relative">
                <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-xl"></div>
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg md:h-20 md:w-20 dark:from-blue-400 dark:to-indigo-500">
                                <Megaphone className="h-8 w-8 text-white md:h-10 md:w-10" />
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-3">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/50">
                            <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                                Advertisement Space
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-white">
                            Want to advertise here or promote something?
                        </h3>

                        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-700 md:mx-0 md:text-base dark:text-slate-200">
                            This is a premium advertising space reaching thousands of DIU students. Contact us to discuss how we can help
                            promote your product, service, or message to our engaged audience.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0">
                        <Button
                            asChild
                            size="lg"
                            className="group/btn relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl md:px-8 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                        >
                            <a href="mailto:info@diuqbank.com">
                                <span className="relative z-10 flex items-center gap-2">
                                    Contact Us
                                    <Mail className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </span>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full"></div>
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
