@if ($paginator->hasPages())
<nav role="navigation" aria-label="Pagination Navigation" class="flex items-center justify-center">
    <div class="inline-flex items-center gap-1 text-sm">
        {{-- Previous Page Link --}}
        @if ($paginator->onFirstPage())
            <span class="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-400 cursor-default">
                <x-lucide-chevron-left class="h-4 w-4" />
            </span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}" rel="prev" class="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
                <x-lucide-chevron-left class="h-4 w-4" />
            </a>
        @endif

        {{-- Mobile-friendly Pagination Elements --}}
        @php
            $currentPage = $paginator->currentPage();
            $lastPage = $paginator->lastPage();
            $isMobile = true; // We'll assume mobile-first approach for simplicity
            
            // For mobile, show only 1 page on each side instead of 2
            $start = max(1, $currentPage - 1);
            $end = min($lastPage, $currentPage + 1);
            
            // Adjust if we're at the beginning or end
            if ($currentPage <= 2) {
                $end = min($lastPage, 3);
            }
            if ($currentPage >= $lastPage - 1) {
                $start = max(1, $lastPage - 2);
            }
        @endphp

        {{-- Show first page if not in range --}}
        @if ($start > 1)
            <a href="{{ $paginator->url(1) }}" class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" aria-label="Go to page 1">1</a>
            @if ($start > 2)
                <span class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">...</span>
            @endif
        @endif

        {{-- Show page range --}}
        @for ($page = $start; $page <= $end; $page++)
            @if ($page == $currentPage)
                <span aria-current="page" class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm">{{ $page }}</span>
            @else
                <a href="{{ $paginator->url($page) }}" class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" aria-label="Go to page {{ $page }}">{{ $page }}</a>
            @endif
        @endfor

        {{-- Show last page if not in range --}}
        @if ($end < $lastPage)
            @if ($end < $lastPage - 1)
                <span class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">...</span>
            @endif
            <a href="{{ $paginator->url($lastPage) }}" class="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" aria-label="Go to page {{ $lastPage }}">{{ $lastPage }}</a>
        @endif

        {{-- Next Page Link --}}
        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}" rel="next" class="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
                <x-lucide-chevron-right class="h-4 w-4" />
            </a>
        @else
            <span class="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-400 cursor-default">
                <x-lucide-chevron-right class="h-4 w-4" />
            </span>
        @endif
    </div>
</nav>
@endif
