@props(['title'])

    <!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ isset($title)?($title. " | DIUQBank " ): "DIU Question Bank | Official Question Bank of Daffodil International University (DIU)" }}</title>
    <meta name="description"
          content="Practice and prepare for your exams with the official question bank of Daffodil International University (DIU).">


    {{-- @filamentStyles --}}
    <!-- Scripts and Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

</head>
<body class="antialiased flex flex-col min-h-screen ">
<!-- Background elements -->
<div class="fixed inset-0 -z-10">
    <div
        class="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950"></div>
    <div class="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20"></div>
    <div class="absolute top-10 right-20 h-32 w-32 rounded-full bg-cyan-200/50 dark:bg-cyan-800/20"></div>
    <div class="absolute bottom-0 right-0 h-40 w-52 rounded-full bg-violet-200/40 dark:bg-violet-900/20"></div>
</div>

<!-- Header Navigation -->
{{-- @include('components.header') --}}

<!-- Main Content -->
<main class="flex-grow">
    {{$slot}}
</main>

<!-- Footer -->
@include('components.footer')

{{-- @livewire('notifications')
@filamentScripts --}}
@stack('scripts')
</body>
</html>
