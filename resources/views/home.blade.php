<x-app-layout>
    <!-- Hero section -->
    <section class="relative overflow-hidden pt-20 pb-40 md:py-32">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row items-center justify-between gap-10">
                <div class="max-w-2xl">
                    <div class="mb-5 px-3.5 py-1.5 text-sm inline-flex items-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                        DIU Question Bank
                    </div>

                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                            Share & Access
                        </span>
                        Exam Question PDFs
                    </h1>

                    <p class="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                        The ultimate platform to find, download, and share exam question papers. Upload your PDFs, help fellow students, and get
                        recognized for your contributions.
                    </p>

                    <div class="flex flex-wrap gap-4">
                        <x-button href="{{ route('questions.index') }}" variant="primary" size="md" class="min-w-[200px]">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Find Question PDFs
                        </x-button>

                        <x-button href="{{ route('questions.create') }}" variant="secondary" size="md" class="min-w-[200px]">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Share Question PDF
                        </x-button>
                    </div>
                </div>

                <div class="hidden md:block w-full max-w-md mt-10 md:mt-0">
                    <div class="relative h-[320px] w-full">
                        <div class="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/20 -z-10"></div>

                        <!-- PDF Card Visualization -->
                        <div class="relative bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-12">
                            <div class="absolute -top-8 -right-8 md:-top-10 md:-right-10">
                                <div class="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                            </div>

                            <div class="pt-6 space-y-3">
                                <div class="h-6 w-3/4 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                                <div class="h-4 w-5/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                                <div class="h-4 w-4/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>

                                <div class="grid grid-cols-3 gap-2 py-2">
                                    <div class="h-8 w-full rounded-lg bg-blue-100 dark:bg-blue-900/50"></div>
                                    <div class="h-8 w-full rounded-lg bg-green-100 dark:bg-green-900/50"></div>
                                    <div class="h-8 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                                </div>

                                <div class="space-y-3 pt-2">
                                    <div class="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                                    <div class="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700"></div>
                                </div>

                                <div class="h-10 w-full rounded-lg bg-blue-500 dark:bg-blue-700 mt-4"></div>
                            </div>

                            <!-- Watermark Visualization -->
                            <div class="absolute bottom-4 right-4 opacity-30 rotate-[-20deg] text-xs text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded px-2 py-1">
                                Contributed by User
                            </div>
                        </div>

                        <!-- Floating elements -->
                        <div class="absolute bottom-0 -left-4 h-28 w-28 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                            <div class="flex flex-col h-full justify-between">
                                <div class="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-700 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                </div>
                                <div class="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                                <div class="h-3 w-5/6 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                                <div class="h-3 w-3/4 rounded-full bg-blue-100 dark:bg-blue-900/50"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    How DIUQBank Works
                </h2>
                <div class="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
                    <div class="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                        1
                    </div>
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
                            Upload PDF
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 mt-2">
                            Share your exam questions by uploading the PDF file with relevant details.
                        </p>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
                    <div class="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                        2
                    </div>
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="8" r="7"></circle>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
                            Get Credit
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 mt-2">
                            Your contribution is recognized with your name watermarked on the PDF.
                        </p>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative">
                    <div class="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                        3
                    </div>
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
                            Help Others
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 mt-2">
                            Fellow students can easily find and download the question papers they need.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats section -->
    <section class="py-16 relative">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div class="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div class="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 opacity-20"></div>
                    <div class="flex flex-col items-center text-center z-10 relative">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
                            500+
                        </h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            PDF Questions
                        </p>
                    </div>
                </div>

                <div class="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div class="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600 opacity-20"></div>
                    <div class="flex flex-col items-center text-center z-10 relative">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
                            70+
                        </h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Courses
                        </p>
                    </div>
                </div>

                <div class="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div class="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 opacity-20"></div>
                    <div class="flex flex-col items-center text-center z-10 relative">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
                            12+
                        </h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Departments
                        </p>
                    </div>
                </div>

                <div class="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div class="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 opacity-20"></div>
                    <div class="flex flex-col items-center text-center z-10 relative">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
                            100+
                        </h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Contributors
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features section -->
    <section class="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Everything You Need
                </h2>
                <div class="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
                <p class="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                    Empowering your academic success with comprehensive resources and tools
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                        PDF Question Archive
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300">
                        Access a comprehensive collection of previous exam question papers in PDF format from various departments and semesters.
                    </p>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                        Smart Filtering
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300">
                        Find exactly what you need with our intuitive filtering system by semester, course, exam type, and more.
                    </p>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                        Contributor Recognition
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300">
                        Get credit for your uploads with automatic watermarking on PDFs, recognizing your contribution to the community.
                    </p>
                </div>
            </div>
        </div>
    </section>
</x-app-layout>
