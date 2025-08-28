@extends('layouts.app')

@section('title', 'Questions')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Questions</h1>
  
            <a href="{{ route('questions.create') }}" 
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 font-medium">
                <x-lucide-plus class="h-4 w-4" />
                Add Question
            </a>

    </div>

    <div class="relative border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm rounded-xl pt-6 pb-5 {{ array_filter($filters) ? 'ring-1 ring-blue-200 dark:ring-blue-700/40' : '' }} mb-6">
        <div class="px-6 pt-0 pb-0">
            <div class="pr-24 mb-4">
                <h3 class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white text-xs font-bold shadow-sm">F</span>
                    <span>Filters</span>
                    @if (array_filter($filters))
                        <span class="ml-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700 dark:text-blue-300">Active</span>
                    @endif
                </h3>
                @if (array_filter($filters))
                    <a href="{{ url('/questions') }}" class="absolute top-4 right-4 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 has-[>svg]:px-3 rounded-full px-4 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all dark:bg-slate-800 dark:hover:bg-red-950/20 dark:text-red-400 dark:hover:text-red-300 dark:border-red-700 dark:hover:border-red-600 font-medium text-xs">
                        <x-lucide-filter-x class="h-3 w-3" /> Reset
                    </a>
                @endif
            </div>
            <form method="get" action="{{ url('/questions') }}" class="grid gap-5 md:grid-cols-4 sm:grid-cols-2 mb-4" id="filters-form">
                <div class="flex flex-col gap-2">
                    <label for="department_id" class="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <x-lucide-building-2 class="h-4 w-4 text-slate-500 dark:text-slate-400" /> Department
                    </label>
                    <select id="department_id" name="department_id" class="w-full h-10 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:border-blue-300 dark:hover:border-slate-500 transition-colors">
                        <option value="">All Departments</option>
                        @foreach ($dropdownData['departments'] as $d)
                            <option value="{{ $d->id }}" @selected($filters['department_id']===$d->id)>{{ $d->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="course_id" class="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <x-lucide-book-open class="h-4 w-4 text-slate-500 dark:text-slate-400" /> Course
                    </label>
                    <select id="course_id" name="course_id" {{ empty($filters['department_id']) ? 'disabled' : '' }} class="w-full h-10 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:border-blue-300 dark:hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <option value="">
                            @if (empty($filters['department_id']))
                                Select Department First
                            @else
                                All Courses from {{ $dropdownData['departments']->firstWhere('id', $filters['department_id'])->name ?? 'Selected Department' }}
                            @endif
                        </option>
                        @foreach ($dropdownData['courses'] as $c)
                            @php $show = empty($filters['department_id']) || $filters['department_id'] === $c->department_id; @endphp
                            @if ($show)
                                <option value="{{ $c->id }}" @selected($filters['course_id']===$c->id)>
                                    {{ $c->name }}
                                    @if (empty($filters['department_id'])) ({{ $dropdownData['departments']->firstWhere('id', $c->department_id)->name ?? '' }}) @endif
                                </option>
                            @endif
                        @endforeach
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="semester_id" class="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <x-lucide-calendar class="h-4 w-4 text-slate-500 dark:text-slate-400" /> Semester
                    </label>
                    <select id="semester_id" name="semester_id" class="w-full h-10 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:border-blue-300 dark:hover:border-slate-500 transition-colors">
                        <option value="">All Semesters</option>
                        @foreach ($dropdownData['semesters'] as $s)
                            <option value="{{ $s->id }}" @selected($filters['semester_id']===$s->id)>{{ $s->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="exam_type_id" class="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <x-lucide-shapes class="h-4 w-4 text-slate-500 dark:text-slate-400" /> Exam Type
                    </label>
                    <select id="exam_type_id" name="exam_type_id" class="w-full h-10 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:border-blue-300 dark:hover:border-slate-500 transition-colors">
                        <option value="">All Exam Types</option>
                        @foreach ($dropdownData['exam_types'] as $e)
                            <option value="{{ $e->id }}" @selected($filters['exam_type_id']===$e->id)>{{ $e->name }}</option>
                        @endforeach
                    </select>
                </div>
                <input type="hidden" name="page" value="1" />
            </form>
        </div>
    </div>

    @if ($questions->isEmpty())
        <p class="text-slate-500 dark:text-slate-400 mt-8">No questions found.</p>
    @else
        <div class="grid gap-4 grid-cols-1 mt-6">
            @foreach ($questions as $q)
                <x-question-card :question="$q" />
            @endforeach
        </div>
        <div class="mt-8 flex justify-center">
            {{ $questions->onEachSide(1)->links('vendor.pagination.diuqbank') }}
        </div>
    @endif
</div>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('filters-form');
    const selects = form.querySelectorAll('select');
    const departmentSelect = document.getElementById('department_id');
    const courseSelect = document.getElementById('course_id');
    
    function submitWithCleanUrl() {
        // Create a clean URL with only non-empty filter values
        const baseUrl = window.location.pathname;
        const params = new URLSearchParams();
        
        // Add only non-empty filter values
        selects.forEach(function(select) {
            if (select.value && select.value.trim() !== '') {
                params.append(select.name, select.value);
            }
        });
        
        // Always reset to page 1 when filters change
        if (params.toString()) {
            params.append('page', '1');
        }
        
        // Navigate to the clean URL
        const newUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        window.location.href = newUrl;
    }
    
    // Handle department change to reset course selection
    departmentSelect.addEventListener('change', function() {
        // Reset course selection when department changes
        courseSelect.value = '';
        
        // Enable/disable course select based on department selection
        if (departmentSelect.value) {
            courseSelect.disabled = false;
            const selectedDepartmentText = departmentSelect.options[departmentSelect.selectedIndex].text;
            courseSelect.querySelector('option[value=""]').textContent = `All Courses from ${selectedDepartmentText}`;
        } else {
            courseSelect.disabled = true;
            courseSelect.querySelector('option[value=""]').textContent = 'Select Department First';
        }
        
        submitWithCleanUrl();
    });
    
    // Handle other select changes
    selects.forEach(function (sel) {
        // Skip department select since we handle it separately
        if (sel.id !== 'department_id') {
            sel.addEventListener('change', submitWithCleanUrl);
        }
    });
});
</script>
@endsection


