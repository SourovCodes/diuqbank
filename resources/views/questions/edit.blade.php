@extends('layouts.app')

@section('title', 'Edit Question')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
            <a href="{{ route('questions.show', $question) }}" class="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <x-lucide-arrow-left class="h-4 w-4" />
                Back to Question
            </a>
        </div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Edit Question</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Update question details and optionally replace the PDF</p>
    </div>

    <x-question-form 
        :question="$question"
        :dropdownData="$dropdownData"
        submitText="Update Question"
        :cancelUrl="route('questions.show', $question)"
    />
</div>

@vite(['resources/js/question-form.js'])
<script>
document.addEventListener('DOMContentLoaded', function() {
    new QuestionForm({
        isEdit: true,
        questionId: {{ $question->id }},
        courses: @json($dropdownData['courses'])
    });
});
</script>
@endsection
