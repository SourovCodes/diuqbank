@extends('layouts.app')

@section('title', 'Contributors')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold mb-6 text-slate-900 dark:text-white">Top Contributors</h1>

    @if ($contributors->isEmpty())
        <p class="text-slate-500 dark:text-slate-400 mt-8">No contributors found.</p>
    @else
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
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            @foreach ($contributors as $c)
                <a href="{{ url('/contributors/'.$c->username) }}" class="block group">
                    <div class="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4 rounded-xl">
                        <div class="px-4 py-0 relative z-10 flex flex-col h-full">
                            <div class="flex items-start gap-3 mb-4">
                                <div class="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-semibold">
                                    @if (!empty($c->image))
                                        <img src="{{ $c->image }}" alt="{{ $c->name }}" class="h-full w-full object-cover" />
                                    @else
                                        {{ collect(explode(' ', $c->name))->map(fn($w) => mb_substr($w,0,1))->join('') }}
                                    @endif
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{{ $c->name }}</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">@ {{ $c->username }}</p>
                                    @if (!empty($c->student_id))
                                        <p class="text-xs text-slate-500 dark:text-slate-500">ID: {{ $c->student_id }}</p>
                                    @endif
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-xs"><x-lucide-file-text class="h-3.5 w-3.5" /> {{ $c->questions_count }} Questions</span>
                                <span class="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 text-xs"><x-lucide-eye class="h-3.5 w-3.5" /> {{ $compactNum($c->total_views) }} Views</span>
                            </div>
                            <div class="mt-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 mb-3">
                                <div class="flex items-center"><x-lucide-users class="mr-1.5 h-3.5 w-3.5" /> <span>Contributor</span></div>
                            </div>
                            <div class="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <x-lucide-arrow-right class="h-3 w-3 text-blue-700 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                </a>
            @endforeach
        </div>
        <div class="mt-8 flex justify-center">
            {{ $contributors->onEachSide(1)->links('vendor.pagination.diuqbank') }}
        </div>
    @endif
</div>
@endsection


