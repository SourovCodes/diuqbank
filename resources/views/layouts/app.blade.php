<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Laravel') }}</title>
   @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="antialiased bg-neutral-50 font-sans text-neutral-900">
    <div class="flex min-h-screen flex-col">
        <x-layout.navbar />

        <main class="flex-1">
            {{ $slot }}
        </main>

        <x-layout.footer />
    </div>

    @stack('scripts')
</body>

</html>