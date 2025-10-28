import { Button } from '@/components/ui/button';
import { ExternalLink, GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Course {
    title: string;
    description: string;
    image?: string;
    badge: string;
}

const courses: Course[] = [
    {
        title: 'নিজেকে আরও দক্ষ করে তুলুন! 🚀',
        description:
            'ভাষা শেখা থেকে শুরু করে চাকরি জীবনে সফল হওয়া পর্যন্ত সকল গুরুত্বপূর্ণ স্কিল শিখুন 10 Minute School এর সাথে। হাজারো কোর্স, লাইভ ক্লাস এবং এক্সপার্ট ইন্সট্রাক্টরদের সাথে এগিয়ে যান ক্যারিয়ারে!',
        badge: 'প্রিমিয়াম অফার',
    },
    {
        title: 'Email Marketing করে Freelancing শুরু করুন! 💼',
        description:
            'ফ্রিল্যান্সিং এ সফল হতে চান? Email Marketing এ দক্ষ হয়ে আয় করুন ঘরে বসেই। প্র্যাক্টিকাল প্রজেক্ট সহ শিখুন প্রফেশনাল Email Marketing!',
        image: '/Skill Courses_ Contents (All)/Email Marketing/Statics/EMKF-2.jpg',
        badge: 'ফ্রিল্যান্সিং কোর্স',
    },
    {
        title: 'IELTS প্রস্তুতি নিন এক্সপার্টদের সাথে! 🎓',
        description:
            'বিদেশে পড়াশোনা বা চাকরির স্বপ্ন? IELTS এ ভালো স্কোর করুন Munzereen Shahid এর গাইডেন্সে। Speaking, Writing, Reading, Listening - সব সেকশনে পারদর্শী হন!',
        badge: 'IELTS কোর্স',
    },
    {
        title: 'ঘরে বসে Spoken English শিখুন! 🗣️',
        description:
            'ইংরেজিতে কথা বলতে ভয় পান? আর নয়! ঘরে বসেই শিখুন Spoken English এবং আত্মবিশ্বাসের সাথে কথা বলুন যেকোনো পরিবেশে।',
        badge: 'ইংরেজি কোর্স',
    },
];

export default function AffiliateBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % courses.length);
                setIsTransitioning(false);
            }, 300);
        }, 8000); // Change course every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const currentCourse = courses[currentIndex];

    return (
        <div className="group relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-lg transition-all hover:shadow-2xl md:p-8 dark:border-emerald-700 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-cyan-950/50">
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

            {/* Decorative sparkle icon */}
            <div className="absolute -top-6 -right-6 h-32 w-32 rotate-12 opacity-10 transition-transform duration-700 group-hover:rotate-45 dark:opacity-20">
                <Sparkles className="h-full w-full text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className={`relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                    {/* Image or Icon Section */}
                    <div className="flex-shrink-0">
                        {currentCourse.image ? (
                            <div className="relative h-32 w-32 overflow-hidden rounded-xl shadow-lg md:h-40 md:w-40">
                                <img
                                    src={currentCourse.image}
                                    alt={currentCourse.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20 blur-xl"></div>
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg md:h-20 md:w-20 dark:from-emerald-400 dark:to-teal-500">
                                    <GraduationCap className="h-8 w-8 text-white md:h-10 md:w-10" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-2">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-900/50">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                {currentCourse.badge}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-white">{currentCourse.title}</h3>

                        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-700 md:mx-0 md:text-base dark:text-slate-200">
                            {currentCourse.description.split('10 Minute School').map((part, i, arr) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">10 Minute School</span>
                                    )}
                                </span>
                            ))}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-600 md:justify-start dark:text-slate-400">
                            <span className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 shadow-sm dark:bg-slate-800/60">
                                ✨ ফ্রি কোর্স
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 shadow-sm dark:bg-slate-800/60">
                                🎯 লাইভ ক্লাস
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 shadow-sm dark:bg-slate-800/60">
                                🏆 সার্টিফিকেট
                            </span>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex justify-center gap-1.5 pt-3 md:justify-start">
                            {courses.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentIndex(index);
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                    className={`h-1.5 rounded-full transition-all ${
                                        index === currentIndex
                                            ? 'w-8 bg-emerald-600 dark:bg-emerald-400'
                                            : 'w-1.5 bg-emerald-300 hover:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                                    }`}
                                    aria-label={`View course ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0">
                        <Button
                            asChild
                            size="lg"
                            className="group/btn relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6 font-semibold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl md:px-8 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600"
                        >
                            <a href="https://10ms.io/hEkKvS" target="_blank" rel="noopener noreferrer">
                                <span className="relative z-10 flex items-center gap-2">
                                    এখনই শুরু করুন
                                    <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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
