@extends('layouts.app')

@section('title', ($question->course->name ?? 'Question') . ' (' . ($question->department->short_name ?? 'N/A') . '), ' . ($question->semester->name ?? 'N/A') . ', ' . ($question->examType->name ?? 'N/A'))

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {{-- Header Section --}}
    <div class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="min-w-0">
                <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ $question->course->name ?? 'Question' }}</h1>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 text-xs">
                        <x-lucide-building-2 class="h-3.5 w-3.5" /> 
                        {{ $question->department->short_name ?? 'N/A' }}
                    </span>
                    <span class="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 text-xs">
                        {{ $question->examType->name ?? 'N/A' }}
                    </span>
                    <span class="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 text-xs">
                        <x-lucide-calendar class="h-3 w-3" /> 
                        {{ $question->semester->name ?? 'N/A' }}
                    </span>
                    @if($question->section)
                        <span class="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 text-xs">
                            Section {{ $question->section }}
                        </span>
                    @endif
                    <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 text-xs">
                        <x-lucide-eye class="h-3 w-3" /> 
                        {{ number_format((int) $question->view_count) }} views
                    </span>
                </div>
            </div>
            
            {{-- Action Buttons --}}
            <div class="flex items-center gap-2">
                @auth
                    @if(auth()->id() === $question->user_id)
                        <a href="{{ route('questions.edit', $question) }}" 
                            class="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <x-lucide-pencil class="h-4 w-4" />
                            Edit
                        </a>
                    @endif
                @endauth
                @if ($question->pdf_url)
                    <a href="{{ $question->pdf_url }}" target="_blank" rel="noopener" 
                        class="inline-flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium transition-colors">
                        <x-lucide-download class="h-4 w-4" />
                        Download PDF
                    </a>
                @endif
                <button id="shareBtn" type="button" 
                    class="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <x-lucide-share-2 class="h-4 w-4" />
                    Share
                </button>
            </div>
        </div>
    </div>

    {{-- Status Notice for Non-Published Questions --}}
    @if($question->status !== App\Enums\QuestionStatus::PUBLISHED && auth()->check() && auth()->id() === $question->user_id)
        <div class="mb-6">
            @if($question->status === App\Enums\QuestionStatus::PENDING_REVIEW)
                <div class="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20 p-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <x-lucide-clock class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Only you can see this question
                            </h3>
                            <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                This question is pending review from a moderator. It will be visible to other users once it's approved and published.
                            </p>
                        </div>
                    </div>
                </div>
            @elseif($question->status === App\Enums\QuestionStatus::REJECTED)
                <div class="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <x-lucide-x-circle class="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                                Only you can see this question
                            </h3>
                            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                                This question has been rejected by a moderator and is not visible to other users. You may edit and resubmit it for review.
                            </p>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    @endif

    {{-- Main Content Grid --}}
    <div class="grid gap-6 lg:grid-cols-12">
        {{-- PDF Viewer --}}
        <div class="lg:col-span-8">
            <div class="flex justify-end gap-2 mb-2">
                <button id="fullscreenBtn" type="button" 
                    class="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <x-lucide-maximize class="h-3.5 w-3.5" /> 
                    Fullscreen
                </button>
            </div>
            <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl relative" id="viewerContainer">
                @php
                    $pdfUrl = $question->pdf_url ?? null;
                @endphp
                @if ($pdfUrl)
                    <object data="{{ $pdfUrl }}" type="application/pdf" class="w-full h-full min-h-[500px] md:min-h-[700px]" title="{{ $question->course->name ?? 'Question' }}">
                        <iframe src="https://drive.google.com/viewerng/viewer?embedded=true&amp;url={{ urlencode($pdfUrl) }}" 
                            width="100%" height="100%" class="min-h-[500px] md:min-h-[700px]"></iframe>
                    </object>
                @else
                    <div class="p-6 text-slate-600 dark:text-slate-300 text-sm">PDF is not available.</div>
                @endif
            </div>
        </div>

        {{-- Sidebar --}}
        <aside class="lg:col-span-4">
            <div class="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Question Information</h2>
                </div>
                <div class="px-6 py-4 space-y-4">
                    {{-- Uploader Info --}}
                    <a href="{{ url('/contributors/'.$question->user?->username) }}" 
                        class="group flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 hover:border-blue-300 dark:hover:border-blue-600 transition">
                        <div class="h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-xs font-semibold">
                            @if (!empty($question->user?->image))
                                <img src="{{ $question->user?->image }}" alt="{{ $question->user?->name }}" class="h-full w-full object-cover" />
                            @else
                                {{ collect(explode(' ', trim($question->user?->name ?? 'U')))->filter()->map(fn($w) => mb_substr($w,0,1))->join('') }}
                            @endif
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs text-slate-600 dark:text-slate-300">Uploaded by</div>
                            <div class="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:underline">{{ $question->user?->name ?? 'Unknown' }}</div>
                            <div class="text-xs text-slate-500 truncate">@ {{ $question->user?->username }}</div>
                        </div>
                        <x-lucide-chevron-right class="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </a>
                    
                    {{-- File Stats --}}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div class="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3">
                            <div class="text-[11px] text-slate-500">File Size</div>
                            <div class="font-medium text-slate-800 dark:text-slate-200">{{ number_format(((int) $question->pdf_size) / 1024 / 1024, 2) }} MB</div>
                        </div>
                        <div class="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3">
                            <div class="text-[11px] text-slate-500">Uploaded</div>
                            <div class="font-medium text-slate-800 dark:text-slate-200">{{ optional($question->created_at)->format('M d, Y') }}</div>
                        </div>
                    </div>
                    
                    {{-- Quick Actions --}}
                    <div class="space-y-2">
                        <div class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Related Questions</div>
                        <a href="{{ route('questions.index', ['course_id' => $question->course_id]) }}" 
                            class="flex items-center gap-2 p-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <x-lucide-book-open class="h-4 w-4" />
                            More from this course
                            <x-lucide-arrow-right class="h-3 w-3 ml-auto" />
                        </a>
                        <a href="{{ route('questions.index', ['department_id' => $question->department_id]) }}" 
                            class="flex items-center gap-2 p-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <x-lucide-building-2 class="h-4 w-4" />
                            Department questions
                            <x-lucide-arrow-right class="h-3 w-3 ml-auto" />
                        </a>
                        <a href="{{ route('questions.index', ['exam_type_id' => $question->exam_type_id]) }}" 
                            class="flex items-center gap-2 p-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <x-lucide-clipboard-check class="h-4 w-4" />
                            Similar exam types
                            <x-lucide-arrow-right class="h-3 w-3 ml-auto" />
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Fullscreen functionality
    const btn = document.getElementById('fullscreenBtn');
    const container = document.getElementById('viewerContainer');
    if (!btn || !container) return;
    
    btn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    });
    
    document.addEventListener('fullscreenchange', function () {
        const isFs = document.fullscreenElement === container;
        if (isFs) {
            btn.classList.add('hidden');
        } else {
            btn.classList.remove('hidden');
        }
    });

    // Share functionality
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async function () {
            const url = window.location.href;
            const title = '{{ $question->course->name ?? "Question" }} - DIUQBank';

            if (navigator.share) {
                try {
                    await navigator.share({ title, url });
                } catch (err) {
                    console.log('Share cancelled');
                }
            } else {
                try {
                    await navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                } catch (err) {
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Link copied to clipboard!');
                }
            }
        });
    }
});
</script>
@endsection


