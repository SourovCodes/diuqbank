@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Section -->
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p class="text-slate-600 dark:text-slate-400 mt-1">Welcome back, {{ $user->name }}!</p>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a href="{{ route('questions.create') }}" 
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 font-medium">
                    <x-lucide-plus class="h-4 w-4" />
                    <span class="hidden sm:inline">Add Question</span>
                    <span class="sm:hidden">Add</span>
                </a>
                <a href="{{ route('profile.edit') }}" 
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 has-[>svg]:px-4 rounded-full px-6 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md transition-all font-medium">
                    <x-lucide-user class="h-4 w-4" />
                    <span class="hidden sm:inline">Edit Profile</span>
                    <span class="sm:hidden">Profile</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Questions</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ number_format($stats['total_questions']) }}</p>
                </div>
                <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <x-lucide-file-text class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Published</p>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ number_format($stats['published_questions']) }}</p>
                </div>
                <div class="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <x-lucide-check-circle class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Review</p>
                    <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ number_format($stats['pending_questions']) }}</p>
                </div>
                <div class="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <x-lucide-clock class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Need Fix</p>
                    <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ number_format($stats['need_fix_questions']) }}</p>
                </div>
                <div class="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <x-lucide-x-circle class="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Views</p>
                    <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ number_format($stats['total_views']) }}</p>
                </div>
                <div class="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <x-lucide-eye class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
            </div>
        </div>
    </div>

    <!-- Questions Section -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Your Questions</h2>
                <a href="{{ route('questions.index') }}?uploader={{ $user->id }}" 
                    class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    View All →
                </a>
            </div>
        </div>

        @if($questions->count() > 0)
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($questions as $question)
                        <x-question-card :question="$question" />
                    @endforeach
                </div>

                @if($questions->hasPages())
                    <div class="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                        {{ $questions->links() }}
                    </div>
                @endif
            </div>
        @else
            <div class="p-12 text-center">
                <div class="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <x-lucide-file-text class="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No questions yet</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Start contributing to the question bank by adding your first question.</p>
                <a href="{{ route('questions.create') }}" 
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 font-medium">
                    <x-lucide-plus class="h-4 w-4" />
                    Add Your First Question
                </a>
            </div>
        @endif
    </div>
</div>
@endsection
