<footer class="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
            <div class="col-span-1 md:col-span-2 lg:col-span-1">
                <a href="{{ url('/') }}" class="inline-flex items-center mb-4">
                    <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">DIUQBank</span>
                </a>
                <p class="text-slate-600 dark:text-slate-400 mb-4">The ultimate platform for finding, downloading, and sharing exam question papers at Daffodil International University.</p>
                <div class="flex space-x-4">
                    <a href="https://facebook.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank" rel="noopener">
                        <x-lucide-facebook class="h-5 w-5" />
                        <span class="sr-only">Facebook</span>
                    </a>
                    <a href="https://twitter.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank" rel="noopener">
                        <x-lucide-twitter class="h-5 w-5" />
                        <span class="sr-only">Twitter</span>
                    </a>
                    <a href="https://instagram.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank" rel="noopener">
                        <x-lucide-instagram class="h-5 w-5" />
                        <span class="sr-only">Instagram</span>
                    </a>
                    <a href="https://linkedin.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank" rel="noopener">
                        <x-lucide-linkedin class="h-5 w-5" />
                        <span class="sr-only">LinkedIn</span>
                    </a>
                    <a href="https://github.com" class="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank" rel="noopener">
                        <x-lucide-github class="h-5 w-5" />
                        <span class="sr-only">GitHub</span>
                    </a>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h3>
                <ul class="space-y-2">
                    <li><a href="{{ url('/') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Home</a></li>
                    <li><a href="{{ url('/questions') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Questions</a></li>
                    <li><a href="{{ url('/about') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">About</a></li>
                    <li><a href="{{ url('/contact') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</a></li>
                </ul>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h3>
                <ul class="space-y-2">
                    <li><a href="{{ url('/questions/create') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Upload</a></li>
                    <li><a href="{{ url('/privacy') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</a></li>
                    <li><a href="{{ url('/terms') }}" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Terms &amp; Conditions</a></li>
                </ul>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact Us</h3>
                <div class="space-y-3">
                    <p class="text-slate-600 dark:text-slate-400 flex items-center"><x-lucide-mail class="h-4 w-4 mr-2" /> contact@diuqbank.com</p>
                    <a href="{{ url('/contact') }}" class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 has-[>svg]:px-4 rounded-full px-8 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600 font-medium">
                        <x-lucide-send class="h-4 w-4" />
                        Send Message
                    </a>
                </div>
            </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
                    <p class="mb-2">© {{ now()->year }} DIUQBank. All rights reserved.</p>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center">Made with <x-lucide-heart class="h-4 w-4 mx-1 text-red-500" /> for DIU Students</p>
            </div>
        </div>
    </div>
</footer>


