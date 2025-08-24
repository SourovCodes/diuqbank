@extends('layouts.app')

@section('title', $contributor->name)

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl py-6">
        <div class="px-6">
            <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                <div class="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-semibold">
                    @if (!empty($contributor->image))
                        <img src="{{ $contributor->image }}" alt="{{ $contributor->name }}" class="h-full w-full object-cover" />
                    @else
                        {{ collect(explode(' ', $contributor->name))->map(fn($w) => mb_substr($w,0,1))->join('') }}
                    @endif
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="min-w-0">
                            <h1 class="text-2xl font-bold text-slate-900 dark:text-white truncate">{{ $contributor->name }}</h1>
                            <p class="text-sm text-slate-600 dark:text-slate-400 truncate">@ {{ $contributor->username }}</p>
                            @if (!empty($contributor->student_id))
                                <p class="text-sm text-slate-500 truncate">ID: {{ $contributor->student_id }}</p>
                            @endif
                        </div>
                        @if (auth()->check() && auth()->id() === $contributor->id)
                            <div class="flex items-center">
                                @php $editUrl = \Illuminate\Support\Facades\Route::has('profile.edit') ? route('profile.edit') : url('/profile'); @endphp
                                <a href="{{ $editUrl }}" class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <x-lucide-pencil class="h-4 w-4" /> Edit Profile
                                </a>
                            </div>
                        @endif
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-center">
                            <div class="text-base font-semibold text-slate-900 dark:text-white">{{ $contributor->questions_count }}</div>
                            <div class="text-[11px] text-slate-500">Questions</div>
                        </div>
                        @php
                            $compactNum = function ($value) {
                                $n = (int) ($value ?? 0);
                                if ($n < 1000) return (string) $n;
                                $units = [ ['v' => 1000000000, 's' => 'B'], ['v' => 1000000, 's' => 'M'], ['v' => 1000, 's' => 'K'] ];
                                foreach ($units as $u) {
                                    if ($n >= $u['v']) {
                                        $num = $n / $u['v'];
                                        return (fmod($num, 1.0) === 0.0 ? number_format($num, 0) : number_format($num, 1)) . $u['s'];
                                    }
                                }
                                return (string) $n;
                            };
                        @endphp
                        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-center">
                            <div class="text-base font-semibold text-slate-900 dark:text-white">{{ $compactNum($contributor->total_views) }}</div>
                            <div class="text-[11px] text-slate-500">Views</div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>

    <h2 class="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Questions by {{ $contributor->name }}</h2>

    @if ($questions->isEmpty())
        <p class="text-slate-500 dark:text-slate-400 mt-4">No questions found.</p>
    @else
        <div class="grid gap-4 grid-cols-1 mt-2">
            @foreach ($questions as $q)
                <x-question-card :question="$q" />
            @endforeach
        </div>
        <div class="mt-8 flex justify-center">
            {{ $questions->onEachSide(1)->links('vendor.pagination.diuqbank') }}
        </div>
    @endif
</div>
@endsection


