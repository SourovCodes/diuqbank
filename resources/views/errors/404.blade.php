@extends('layouts.app')

@section('title', '404 - Page Not Found')

@section('content')
<div class="min-h-[70vh] flex items-center">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
            <div class="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <x-lucide-search-x class="h-10 w-10 text-white" />
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Page not found</h1>
            <p class="text-slate-600 dark:text-slate-300 mb-8">The page you’re looking for doesn’t exist or may have been moved.</p>
            <div class="flex items-center justify-center gap-3">
                <a href="{{ url('/') }}" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium">
                    <x-lucide-home class="mr-2 h-4 w-4" />
                    Go to Homepage
                </a>
                <a href="{{ route('questions.index') }}" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 has-[>svg]:px-4 rounded-full px-8 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600 min-w-[200px] font-medium">
                    <x-lucide-file-text class="mr-2 h-4 w-4" />
                    Browse Questions
                </a>
            </div>
            <div class="mt-6 text-sm text-slate-500 dark:text-slate-400">
                Still need help? <a href="{{ url('/contact') }}" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">Contact us</a>.
            </div>
        </div>
    </div>
    </div>
</div>
@endsection


