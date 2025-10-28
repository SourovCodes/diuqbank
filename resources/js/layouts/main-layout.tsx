import AffiliateBanner from '@/components/affiliate-banner';
import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast, Toaster } from 'sonner';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <>
            {/* Background elements */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950" />
                <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20" />
                <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-cyan-200/50 dark:bg-cyan-800/20" />
                <div className="absolute right-0 bottom-0 h-40 w-52 rounded-full bg-violet-200/40 dark:bg-violet-900/20" />
            </div>
            <Navigation />

            {children}

            {/* Affiliate Banner - Shown on all pages */}
            <section className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AffiliateBanner />
                </div>
            </section>

            <Footer />

            <Toaster position="top-right" expand={true} richColors closeButton />
        </>
    );
}
