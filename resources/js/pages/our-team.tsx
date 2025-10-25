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
                    <Card className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500">
                                    <span className="text-4xl font-bold text-white">SB</span>
                                </div>

                                {/* Name & Role */}
                                <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Sourov Biswas</h2>
                                <p className="mb-6 text-slate-600 dark:text-slate-400">Founder • Developer • Maintainer</p>

                                {/* Description */}
                                <p className="mb-8 max-w-2xl text-slate-600 dark:text-slate-300">
                                    Building DIUQBank to democratize access to exam preparation materials for all DIU students. 
                                    Every line of code, every feature, and all operational costs — managed and funded independently.
                                </p>

                                {/* Tech Stack */}
                                <div className="mb-8 flex flex-wrap justify-center gap-2">
                                    {['Laravel', 'React', 'Inertia.js', 'Filament', 'TypeScript', 'Tailwind'].map((tech) => (
                                        <span
                                            key={tech}
                                            className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                {/* Social Links */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <a
                                        href="https://www.linkedin.com/in/sourov-biswas/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                    </a>
                                    <a
                                        href="https://github.com/SourovCodes"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <Github className="h-4 w-4" />
                                        <span>GitHub</span>
                                    </a>
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
