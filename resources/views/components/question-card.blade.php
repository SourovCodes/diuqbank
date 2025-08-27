@props(['question'])

<a href="{{ url('/questions/'.$question->id) }}" class="block group">
    <div class="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4 rounded-xl">
        <div class="px-4 py-0 relative z-10 flex flex-col h-full">
            <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">{{ $question->course->name ?? 'Unknown Course' }}</h3>
                
                <div class="flex items-center gap-1 flex-shrink-0">
                    {{-- "Your Question" badge for question owner --}}
                    @auth
                        @if(auth()->id() === $question->user_id)
                            <span class="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 text-xs font-medium">
                                <x-lucide-user class="h-3 w-3" />
                                Your Question
                            </span>
                        @endif
                    @endauth
                    
                    {{-- Status indicator for non-published questions when viewing own questions --}}
                    @auth
                        @if(auth()->id() === $question->user_id && $question->status !== App\Enums\QuestionStatus::PUBLISHED)
                            <span class="inline-flex items-center gap-1 rounded-md text-xs px-2 py-1 font-medium
                                @if($question->status === App\Enums\QuestionStatus::PENDING_REVIEW)
                                    bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300
                                @elseif($question->status === App\Enums\QuestionStatus::REJECTED)
                                    bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300
                                @endif
                            ">
                                @if($question->status === App\Enums\QuestionStatus::PENDING_REVIEW)
                                    <x-lucide-clock class="h-3 w-3" />
                                    Pending Review
                                @elseif($question->status === App\Enums\QuestionStatus::REJECTED)
                                    <x-lucide-x-circle class="h-3 w-3" />
                                    Rejected
                                @endif
                            </span>
                        @endif
                    @endauth
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 text-xs"><x-lucide-building-2 class="h-3.5 w-3.5" /> {{ $question->department->short_name ?? 'N/A' }}</span>
                <span class="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-xs">{{ $question->examType->name ?? 'N/A' }}</span>
                <span class="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 text-xs"><x-lucide-calendar class="h-3 w-3" /> {{ $question->semester->name ?? 'N/A' }}</span>
            </div>
            <div class="mt-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 mb-3">
                <div class="flex items-center"><x-lucide-clock class="mr-1.5 h-3.5 w-3.5" /> <span>{{ optional($question->created_at)->format('M d, Y') }}</span></div>
                <div class="flex items-center"><x-lucide-eye class="mr-1.5 h-3.5 w-3.5" /> <span>{{ (int) $question->view_count }} views</span></div>
                <div class="flex items-center"><x-lucide-file-text class="mr-1.5 h-3.5 w-3.5" /> <span>{{ number_format(((int) $question->pdf_size) / 1024 / 1024, 2) }} MB</span></div>
            </div>
            <div class="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <x-lucide-arrow-right class="h-3 w-3 text-blue-700 dark:text-blue-400" />
            </div>
        </div>
    </div>
</a>


