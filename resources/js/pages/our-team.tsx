import PageHeader from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';
import { Head } from '@inertiajs/react';
import { Code, Coffee, Github, Linkedin, Server, Sparkles } from 'lucide-react';

export default function OurTeam() {
    return (
        <MainLayout>
            <Head title="Our Team" />

            <div className="container mx-auto px-4 py-16">
                <PageHeader
                    title="Meet the"
                    gradientText="Creator"
                    description="The sole architect behind DIUQBank - building, managing, and funding this platform to help students succeed"
                />

                {/* Main Profile Card */}
                <div className="mb-12">
                    <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="p-0">
                            <div className="grid gap-0 md:grid-cols-5">
                                {/* Left Section - Avatar & Stats */}
                                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-10 py-16 dark:from-blue-500 dark:via-blue-600 dark:to-cyan-500 md:col-span-2 md:py-12">
                                    {/* Decorative elements */}
                                    <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-white/10 blur-3xl" />
                                    <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-10 translate-y-10 rounded-full bg-cyan-400/20 blur-2xl" />
                                    
                                    <div className="relative flex h-full flex-col items-center justify-center text-center">
                                        {/* Avatar */}
                                        <div className="mb-8">
                                            <div className="relative">
                                                <div className="absolute -inset-2 rounded-full bg-white/30 blur-md" />
                                                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 shadow-2xl backdrop-blur-sm">
                                                    <span className="text-6xl font-black text-white drop-shadow-lg">SB</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h2 className="mb-3 text-3xl font-black text-white drop-shadow-md">Sourov Biswas</h2>
                                        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                                            <Sparkles className="h-4 w-4 text-yellow-300" />
                                            <span className="font-bold text-white">Solo Creator</span>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid w-full max-w-xs grid-cols-3 gap-4 rounded-lg bg-white/10 p-5 backdrop-blur-sm">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-white">100%</div>
                                                <div className="mt-1 text-xs font-medium text-white/80">Built</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-white">100%</div>
                                                <div className="mt-1 text-xs font-medium text-white/80">Managed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-white">100%</div>
                                                <div className="mt-1 text-xs font-medium text-white/80">Funded</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Info & Links */}
                                <div className="p-10 md:col-span-3 md:py-12">
                                    <div className="mb-8">
                                        <div className="mb-3 inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Founder • Developer • Maintainer
                                        </div>
                                        <h3 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
                                            The One-Person Powerhouse
                                        </h3>
                                        <p className="mb-4 text-slate-600 dark:text-slate-300">
                                            From the initial concept to every line of code, from design to infrastructure, 
                                            from server management to paying the bills — <span className="font-bold text-slate-900 dark:text-white">everything you see on DIUQBank is the work of one person</span>.
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            This platform exists to democratize access to exam preparation materials for all DIU students. 
                                            No connections required, no barriers to entry — just pure, accessible education for everyone.
                                        </p>
                                    </div>

                                    {/* Tech Stack Pills */}
                                    <div className="mb-8">
                                        <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">TECH STACK</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Laravel', 'React', 'Inertia.js', 'Filament', 'TypeScript', 'Tailwind'].map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href="https://www.linkedin.com/in/sourov-biswas/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                                        >
                                            <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
                                            <span>Connect on LinkedIn</span>
                                        </a>
                                        <a
                                            href="https://github.com/SourovCodes"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-md transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                                        >
                                            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
                                            <span>View GitHub</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Responsibilities Grid */}
                <div className="mb-12">
                    <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
                        Wearing <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">All the Hats</span>
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-md transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-8">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                                    <Code className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Full-Stack Development</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Architected and coded the entire platform using Laravel, React, Inertia.js, and Filament. Every feature, every
                                    line of code.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-md transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-8">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600">
                                    <Server className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Infrastructure & DevOps</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Manages servers, databases, deployments, monitoring, backups, and security. Ensuring 24/7 uptime and smooth
                                    performance.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-md transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardContent className="p-8">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600">
                                    <Coffee className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Funding & Operations</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Self-funding all operational costs including hosting, domain, storage, and third-party services. All from personal
                                    resources.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Mission Statement */}
                <Card className="overflow-hidden border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-0 shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50">
                    <CardContent className="px-8 py-12">
                        <div className="text-center">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">The Mission</h2>
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                                "DIUQBank exists to level the playing field. Every student deserves access to quality exam preparation materials,
                                regardless of their connections or resources. This platform is my contribution to making education more accessible and
                                collaborative for the entire DIU community."
                            </p>
                            <p className="mt-6 font-semibold text-blue-600 dark:text-blue-400">— Sourov Biswas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
