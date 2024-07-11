<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">

    <meta name="application-name" content="{{ config('app.name') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    @if(!request()->header('X-App-Request'))
        <script data-cfasync="false">
            if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia(
                '(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');

            } else {
                document.documentElement.classList.remove('dark')

            }
        </script>
    @endif

    @production
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

    @hasSection('seo')
        @yield('seo')
    @else
        {!! seo() !!}
    @endif

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>

    @filamentStyles
    @vite('resources/css/app.css')
</head>

<body class="bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-950 antialiased flex flex-col min-h-screen">
@if(!request()->header('X-App-Request'))
    @include('inc.navbar')
@endif

{{ $slot }}


@if(!request()->header('X-App-Request'))
    @include('inc.footer')
@endif
@livewire('notifications')

@filamentScripts
@vite('resources/js/app.js')
</body>
</html>
