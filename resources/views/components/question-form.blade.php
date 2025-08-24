@props([
    'question' => null,
    'dropdownData' => [],
    'submitText' => 'Submit',
    'cancelUrl' => '/',
    'formId' => 'question-form'
])

<div class="w-full">
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-xl overflow-hidden">
        <form id="{{ $formId }}" class="space-y-6 p-6">
            @csrf
            @if($question)
                @method('PATCH')
            @endif
            
            <div class="grid gap-6 md:grid-cols-2">
                <!-- Department Selection -->
                <div>
                    <label for="department_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Department <span class="text-red-500">*</span>
                    </label>
                    <select id="department_id" name="department_id" required
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Department</option>
                        @foreach($dropdownData['departments'] ?? [] as $department)
                            <option value="{{ $department->id }}" {{ ($question && $question->department_id == $department->id) ? 'selected' : '' }}>
                                {{ $department->name }}
                            </option>
                        @endforeach
                    </select>
                    <div id="department_id-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                <!-- Course Selection -->
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <label for="course_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Course <span class="text-red-500">*</span>
                        </label>
                        <button type="button" id="add-course-btn" 
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                            <x-lucide-plus class="h-3 w-3" />
                            Add New
                        </button>
                    </div>
                    <select id="course_id" name="course_id" required {{ !$question ? 'disabled' : '' }}
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50">
                        <option value="">{{ !$question ? 'Select Department First' : 'Select Course' }}</option>
                        @if($question)
                            @foreach($dropdownData['courses']->where('department_id', $question->department_id) as $course)
                                <option value="{{ $course->id }}" {{ $question->course_id == $course->id ? 'selected' : '' }}>
                                    {{ $course->name }}
                                </option>
                            @endforeach
                        @endif
                    </select>
                    <div id="course_id-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                <!-- Semester Selection -->
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <label for="semester_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Semester <span class="text-red-500">*</span>
                        </label>
                        <button type="button" id="add-semester-btn" 
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                            <x-lucide-plus class="h-3 w-3" />
                            Add New
                        </button>
                    </div>
                    <select id="semester_id" name="semester_id" required
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Semester</option>
                        @foreach($dropdownData['semesters'] ?? [] as $semester)
                            <option value="{{ $semester->id }}" {{ ($question && $question->semester_id == $semester->id) ? 'selected' : '' }}>
                                {{ $semester->name }}
                            </option>
                        @endforeach
                    </select>
                    <div id="semester_id-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                <!-- Exam Type Selection -->
                <div>
                    <label for="exam_type_id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Exam Type <span class="text-red-500">*</span>
                    </label>
                    <select id="exam_type_id" name="exam_type_id" required
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Exam Type</option>
                        @foreach($dropdownData['exam_types'] ?? [] as $examType)
                            <option value="{{ $examType->id }}" 
                                data-requires-section="{{ $examType->requires_section ? 'true' : 'false' }}"
                                {{ ($question && $question->exam_type_id == $examType->id) ? 'selected' : '' }}>
                                {{ $examType->name }}
                            </option>
                        @endforeach
                    </select>
                    <div id="exam_type_id-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>
            </div>

            <!-- Section Input (conditional) -->
            @php
                $currentExamType = $question ? $dropdownData['exam_types']->firstWhere('id', $question->exam_type_id) : null;
                $showSection = $currentExamType && $currentExamType->requires_section;
            @endphp
            <div id="section-container" class="{{ $showSection ? '' : 'hidden' }}">
                <label for="section" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Section
                </label>
                <input type="text" id="section" name="section" maxlength="5" placeholder="e.g., A, B, C"
                    value="{{ $question->section ?? '' }}" {{ $showSection ? 'required' : '' }}
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <div id="section-error" class="text-red-500 text-sm mt-1 hidden"></div>
            </div>

            <!-- Current PDF Info (for edit mode) -->
            @if($question && $question->pdf_key)
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div class="flex items-center gap-3">
                    <x-lucide-file-text class="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <div class="flex-1">
                        <p class="text-sm font-medium text-blue-700 dark:text-blue-300">Current PDF</p>
                        <p class="text-xs text-blue-600 dark:text-blue-400">
                            Size: {{ number_format($question->pdf_size / 1024, 0) }} KB
                        </p>
                    </div>
                    <a href="{{ $question->pdf_url }}" target="_blank" 
                        class="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <x-lucide-external-link class="h-4 w-4" />
                        View
                    </a>
                </div>
            </div>
            @endif

            <!-- PDF Upload -->
            <div>
                <label for="pdf-upload" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Question Paper (PDF) @if(!$question)<span class="text-red-500">*</span>@else(Optional)@endif
                </label>
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <input type="file" id="pdf-upload" accept=".pdf" class="hidden" {{ !$question ? 'required' : '' }}>
                    <div id="upload-area" class="cursor-pointer">
                        <x-lucide-upload class="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p class="text-slate-600 dark:text-slate-400 mb-1">
                            @if($question)
                                Click to upload a new PDF file
                            @else
                                Click to upload PDF file
                            @endif
                        </p>
                        <p class="text-xs text-slate-500">
                            Maximum file size: 10MB
                            @if($question) • Leave empty to keep current PDF @endif
                        </p>
                    </div>
                    <div id="upload-progress" class="hidden">
                        <div class="flex items-center justify-center gap-2 mb-2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span class="text-sm text-slate-600 dark:text-slate-400">Uploading...</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div id="progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                    <div id="upload-success" class="hidden">
                        <div class="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                            <x-lucide-check-circle class="h-5 w-5" />
                            <span class="text-sm font-medium">
                                @if($question) New PDF uploaded successfully @else PDF uploaded successfully @endif
                            </span>
                        </div>
                    </div>
                </div>
                                    <div id="pdf-upload-error" class="text-red-500 text-sm mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hidden"></div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a href="{{ $cancelUrl }}" 
                    class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Cancel
                </a>
                <button type="submit" id="submit-btn"
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium">
                    <span id="submit-text">{{ $submitText }}</span>
                    <span id="submit-loading" class="hidden items-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {{ $question ? 'Updating...' : 'Creating...' }}
                    </span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Course Creation Modal -->
<div id="course-modal" class="fixed inset-0 z-50 hidden">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-md w-full">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Add New Course</h3>
                    <button type="button" id="close-course-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <x-lucide-x class="h-5 w-5" />
                    </button>
                </div>
                <form id="course-form" class="space-y-4">
                    <div>
                        <label for="course-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Course Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="course-name" name="name" required
                            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Data Structures and Algorithms">
                        <div id="course-name-error" class="text-red-500 text-sm mt-1 hidden"></div>
                    </div>
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" id="cancel-course" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" id="create-course-btn" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium">
                            <span id="course-submit-text">Create Course</span>
                            <span id="course-submit-loading" class="hidden items-center gap-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Semester Creation Modal -->
<div id="semester-modal" class="fixed inset-0 z-50 hidden">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-md w-full">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Add New Semester</h3>
                    <button type="button" id="close-semester-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <x-lucide-x class="h-5 w-5" />
                    </button>
                </div>
                <form id="semester-form" class="space-y-4">
                    <div>
                        <label for="semester-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Semester Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="semester-name" name="name" required
                            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Spring 2024, Fall 2023">
                        <div id="semester-name-error" class="text-red-500 text-sm mt-1 hidden"></div>
                    </div>
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" id="cancel-semester" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" id="create-semester-btn" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium">
                            <span id="semester-submit-text">Create Semester</span>
                            <span id="semester-submit-loading" class="hidden items-center gap-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
