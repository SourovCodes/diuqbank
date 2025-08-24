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
    </head>
    <body class="antialiased flex flex-col min-h-screen bg-background text-foreground">
        <div class="fixed inset-0 -z-10">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"></div>
            <div class="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20"></div>
            <div class="absolute top-10 right-20 h-32 w-32 rounded-full bg-cyan-200/50 dark:bg-cyan-800/20"></div>
            <div class="absolute bottom-0 right-0 h-40 w-52 rounded-full bg-violet-200/40 dark:bg-violet-900/20"></div>
        </div>
        @include('partials.navbar')
        <main id="main" class="flex-1">
            @yield('content')
        </main>
        @include('partials.footer')
    </body>
</html>


