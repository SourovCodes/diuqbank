<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <script>
            (function () {
                try {
                    var d = document.documentElement;
                    var t = localStorage.getItem('theme');
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (t === 'dark' || (!t && prefersDark) || (!t)) {
                        d.classList.add('dark');
                    } else {
                        d.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ trim($__env->yieldContent('title', 'DIUQBank | DIU Question Bank')) }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        
        
        {{-- Toast Flash Messages --}}
        <script>
            window.flashMessages = {
                @if(session('success'))
                    success: @json(session('success')),
                @endif
                @if(session('error'))
                    error: @json(session('error')),
                @endif
                @if(session('warning'))
                    warning: @json(session('warning')),
                @endif
                @if(session('info'))
                    info: @json(session('info')),
                @endif
            };
        </script>

        @production
        <script data-cfasync="false" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5256137078683241"
                crossorigin="anonymous"></script>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QPKSEMRTZ2"></script>
        <script>
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }

            gtag('js', new Date());

            gtag('config', 'G-QPKSEMRTZ2');
        </script>
        @endproduction
    </head>
    <body class="antialiased flex flex-col min-h-screen bg-background text-foreground">
        <div class="fixed inset-0 -z-10">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"></div>
            <div class="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20"></div>
            <div class="absolute top-10 right-20 h-32 w-32 rounded-full bg-cyan-200/50 dark:bg-cyan-800/20"></div>
            <div class="absolute bottom-0 right-0 h-40 w-52 rounded-full bg-violet-200/40 dark:bg-violet-900/20"></div>
        </div>
        @include('partials.navbar')
        
        {{-- Bug Report Notice --}}
        <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div class="flex items-center justify-center gap-3 text-sm">
                    <x-lucide-bug class="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span class="text-amber-800 dark:text-amber-200">
                        Found a bug? Please 
                        <a href="{{ url('/contact') }}" class="font-medium underline hover:no-underline text-amber-900 dark:text-amber-100">
                            report it through our contact page
                        </a> 
                        to help us improve DIUQBank.
                    </span>
                </div>
            </div>
        </div>
        
        <main id="main" class="flex-1">
            @yield('content')
        </main>
        @include('partials.footer')
    </body>
</html>


