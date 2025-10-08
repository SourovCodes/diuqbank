<x-app-layout>
    @php
        $stats = $stats ?? [
            'questions' => 0,
            'courses' => 0,
            'departments' => 0,
            'contributors' => 0,
        ];
    @endphp
    <section class="bg-white py-24">
        <div class="container mx-auto flex flex-col items-start gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div class="max-w-2xl">
                <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">DIU Question Bank</p>
                <h1 class="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                    Share &amp; Access Exam Question PDFs
                </h1>
                <p class="mt-6 text-lg leading-relaxed text-neutral-600">
                    The ultimate platform to find, download, and share exam question papers. Upload your PDFs, help fellow
                    students, and get recognized for your contributions.
                </p>
                <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a href="#stats"
                        class="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
                        Find Question PDFs
                    </a>
                    <a href="#features"
                        class="inline-flex items-center justify-center rounded-full border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white">
                        Share Question PDF
                    </a>
                </div>
            </div>

            <div class="w-full max-w-md rounded-3xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm lg:max-w-lg">
                <div class="space-y-5 text-sm text-neutral-600">
                    <div class="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <span class="font-medium text-neutral-900">Upload PDFs</span>
                        <span class="text-neutral-400">Drag &amp; drop</span>
                    </div>
                    <div class="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Next steps</p>
                        <ul class="mt-3 space-y-2">
                            <li class="flex items-center justify-between">
                                <span>Tag by course &amp; semester</span>
                                <span class="text-neutral-400">Required</span>
                            </li>
                            <li class="flex items-center justify-between">
                                <span>Add exam type</span>
                                <span class="text-neutral-400">Optional</span>
                            </li>
                            <li class="flex items-center justify-between">
                                <span>Preview watermark</span>
                                <span class="text-neutral-400">Automatic</span>
                            </li>
                        </ul>
                    </div>
                    <div class="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recognition</p>
                        <p class="mt-2 text-neutral-600">Your name appears on every shared PDF so your contribution is always acknowledged.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="how-it-works" class="bg-neutral-50 py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl">
                <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">How DIUQBank Works</p>
                <h2 class="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">Share your PDFs in three calm steps</h2>
            </div>
            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">1</span>
                    <h3 class="text-xl font-semibold text-neutral-900">Upload PDF</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Share your exam questions by uploading the PDF file with relevant details like course, semester, and exam type.
                    </p>
                </article>
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">2</span>
                    <h3 class="text-xl font-semibold text-neutral-900">Get Credit</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Your contribution is recognized with your name watermarked on the PDF, so fellow students know who helped.
                    </p>
                </article>
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">3</span>
                    <h3 class="text-xl font-semibold text-neutral-900">Help Others</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Students can easily find and download the question papers they need, building a supportive community.
                    </p>
                </article>
            </div>
        </div>
    </section>

    <section id="stats" class="py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid gap-6 rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                <div class="text-center sm:text-left">
                    <p class="text-3xl font-semibold text-neutral-900">{{ number_format($stats['questions']) }}</p>
                    <p class="mt-2 text-sm uppercase tracking-wide text-neutral-500">PDF Questions</p>
                </div>
                <div class="text-center sm:text-left">
                    <p class="text-3xl font-semibold text-neutral-900">{{ number_format($stats['courses']) }}</p>
                    <p class="mt-2 text-sm uppercase tracking-wide text-neutral-500">Courses</p>
                </div>
                <div class="text-center sm:text-left">
                    <p class="text-3xl font-semibold text-neutral-900">{{ number_format($stats['departments']) }}</p>
                    <p class="mt-2 text-sm uppercase tracking-wide text-neutral-500">Departments</p>
                </div>
                <div class="text-center sm:text-left">
                    <p class="text-3xl font-semibold text-neutral-900">{{ number_format($stats['contributors']) }}</p>
                    <p class="mt-2 text-sm uppercase tracking-wide text-neutral-500">Contributors</p>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="bg-neutral-50 py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl">
                <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Everything You Need</p>
                <h2 class="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                    Empowering your academic success with comprehensive resources and tools
                </h2>
            </div>
            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 class="text-xl font-semibold text-neutral-900">PDF Question Archive</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Access a comprehensive collection of previous exam question papers in PDF format from various departments and semesters.
                    </p>
                </article>
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 class="text-xl font-semibold text-neutral-900">Smart Filtering</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Find exactly what you need with intuitive filters by semester, course, exam type, difficulty, and more.
                    </p>
                </article>
                <article class="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 class="text-xl font-semibold text-neutral-900">Contributor Recognition</h3>
                    <p class="text-sm leading-relaxed text-neutral-600">
                        Get credit for your uploads with automatic watermarking on PDFs, recognizing your contribution to the community.
                    </p>
                </article>
            </div>
        </div>
    </section>
</x-app-layout>