<footer class="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
            <!-- Logo and description -->
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
                <a href="{{ route('home') }}" class="inline-flex items-center mb-4">
                    <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                        DIUQBank
                    </span>
                </a>
                <p class="text-slate-600 dark:text-slate-400 mb-4">
                    The ultimate platform for finding, downloading, and sharing exam
                    question papers at Daffodil International University.
                </p>
                <div class="flex space-x-4">
                    <a href="https://facebook.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                        <span class="sr-only">Facebook</span>
                    </a>
                    <a href="https://twitter.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                        <span class="sr-only">Twitter</span>
                    </a>
                    <a href="https://instagram.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                        <span class="sr-only">Instagram</span>
                    </a>
                    <a href="https://linkedin.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect width="4" height="12" x="2" y="9"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                        <span class="sr-only">LinkedIn</span>
                    </a>
                    <a href="https://github.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                            <path d="M9 18c-4.51 2-5-2-7-2"></path>
                        </svg>
                        <span class="sr-only">GitHub</span>
                    </a>
                </div>
            </div>

            <!-- Quick links -->
            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    Quick Links
                </h3>
                <ul class="space-y-2">
                    <li>
                        <a href="{{ route('home') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Home
                        </a>
                    </li>
                    {{-- <li>
                        <a href="{{ route('questions.index') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Questions
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('about') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('contact') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Contact
                        </a>
                    </li> --}}
                </ul>
            </div>

            <!-- More Links -->
            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    More Links
                </h3>
                <ul class="space-y-2">
                    {{-- <li>
                        <a href="{{ route('questions.create') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Upload
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('privacy') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Privacy Policy
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('terms') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                            Terms & Conditions
                        </a>
                    </li> --}}
                </ul>
            </div>

            <!-- Contact -->
            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    Contact Us
                </h3>
                <div class="space-y-3">
                    <p class="text-slate-600 dark:text-slate-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        contact@diuqbank.com
                    </p>
                    {{-- <a href="{{ route('contact') }}" class="inline-flex justify-center items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:text-blue-400 dark:bg-slate-800 dark:hover:bg-blue-950/50 transition-all w-full">
                        Send Message
                    </a> --}}
                </div>
            </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
                    <p class="mb-2">
                        © {{ date('Y') }} DIUQBank. All rights reserved.
                    </p>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                    Made with 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 mx-1 text-red-500">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                    for DIU Students
                </p>
            </div>
        </div>
    </div>
</footer>