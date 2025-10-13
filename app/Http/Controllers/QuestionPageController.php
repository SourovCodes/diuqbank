<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuestionPageController extends Controller
{
    public function index(Request $request)
    {
        $parseFilterId = static function (?string $value): ?int {
            return is_numeric($value)
                ? (int) $value
                : null;
        };

        $departmentId = $parseFilterId($request->input('department'));
        $semesterId = $parseFilterId($request->input('semester'));
        $courseId = $parseFilterId($request->input('course'));
        $examTypeId = $parseFilterId($request->input('examType'));

        [$departmentOptions, $semesterOptions, $allCourseOptions, $examTypeOptions] = cache()->remember('filter_options', 3600, fn () => [
            Department::select('id', 'short_name as name')->orderBy('short_name')->get(),
            Semester::select('id', 'name')->get(),
            Course::select('id', 'name', 'department_id')->orderBy('name')->get(),
            ExamType::select('id', 'name')->orderBy('name')->get(),
        ]);

        $invalidFiltersDetected = false;

        if ($departmentId !== null && ! $departmentOptions->contains('id', $departmentId)) {
            $departmentId = null;
            $invalidFiltersDetected = true;
        }

        if ($semesterId !== null && ! $semesterOptions->contains('id', $semesterId)) {
            $semesterId = null;
            $invalidFiltersDetected = true;
        }

        if ($courseId !== null) {
            $course = $allCourseOptions->firstWhere('id', $courseId);

            if ($course === null) {
                $courseId = null;
                $invalidFiltersDetected = true;
            } elseif ($departmentId !== null && (int) $course->department_id !== $departmentId) {
                $courseId = null;
                $invalidFiltersDetected = true;
            }
        }

        if ($examTypeId !== null && ! $examTypeOptions->contains('id', $examTypeId)) {
            $examTypeId = null;
            $invalidFiltersDetected = true;
        }

        if ($invalidFiltersDetected) {
            $queryParams = array_filter([
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
                'page' => $request->integer('page') > 1 ? $request->integer('page') : null,
            ], static fn ($value) => $value !== null);

            return redirect()->route('questions.index', $queryParams);
        }

        $query = Question::query();

        // Apply filters
        if ($departmentId !== null) {
            $query->where('department_id', $departmentId);
        }
        if ($semesterId !== null) {
            $query->where('semester_id', $semesterId);
        }
        if ($courseId !== null) {
            $query->where('course_id', $courseId);
        }
        if ($examTypeId !== null) {
            $query->where('exam_type_id', $examTypeId);
        }

        $questions = $query->latest()->paginate(12)->withQueryString();

        // Transform questions to include media URLs
        $questions->getCollection()->transform(function ($question) use ($departmentOptions, $allCourseOptions, $semesterOptions, $examTypeOptions) {
            return [
                'id' => $question->id,
                'created_at' => $question->created_at->toISOString(),
                'view_count' => $question->view_count,
                'section' => $question->section,
                'department' => $departmentOptions->firstWhere('id', $question->department_id)?->short_name??"",
                'course' => $allCourseOptions->firstWhere('id', $question->course_id)?->name??"",
                'semester' => $semesterOptions->firstWhere('id', $question->semester_id)?->name??"",
                'exam_type' => $examTypeOptions->firstWhere('id', $question->exam_type_id)?->name??"",

            ];
        });

        $visibleCourseOptions = $departmentId !== null
            ? $allCourseOptions
                ->where('department_id', $departmentId)
                ->values()
            : $allCourseOptions;

        // Get filter options
        $filterOptions = [
            'departments' => $departmentOptions->toArray(),
            'semesters' => $semesterOptions->toArray(),
            'courses' => $visibleCourseOptions->toArray(),
            'examTypes' => $examTypeOptions->toArray(),
        ];

        return Inertia::render('questions/index', [
            'questions' => $questions,
            'filters' => [
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
            ],
            'filterOptions' => $filterOptions,
        ]);
    }

    public function show(Question $question): Response
    {
        $question->load(['department', 'semester', 'course', 'examType', 'user', 'media']);

        // Transform question data to include media URLs
        $questionData = [
            'id' => $question->id,
            'created_at' => $question->created_at->toISOString(),
            'view_count' => $question->view_count,
            'pdf_size' => $question->pdf_size,
            'pdf_url' => $question->pdf_url,
            'section' => $question->section,
            'department' => [
                'id' => $question->department->id,
                'name' => $question->department->name,
                'short_name' => $question->department->short_name,
            ],
            'course' => [
                'id' => $question->course->id,
                'name' => $question->course->name,
            ],
            'semester' => [
                'id' => $question->semester->id,
                'name' => $question->semester->name,
            ],
            'exam_type' => [
                'id' => $question->examType->id,
                'name' => $question->examType->name,
            ],
            'user' => [
                'id' => $question->user->id,
                'name' => $question->user->name,
                'username' => $question->user->username,
                'student_id' => $question->user->student_id,
                'profile_picture_url' => $question->user->getFirstMediaUrl('profile_picture'),
            ],
        ];

        return Inertia::render('questions/show', [
            'question' => $questionData,
        ]);
    }

    public function incrementView(Question $question)
    {
        // Filter out bots
        $ua = strtolower(request()->userAgent() ?? '');
        $isBot = str_contains($ua, 'bot') ||
                 str_contains($ua, 'crawl') ||
                 str_contains($ua, 'spider');

        if (! $isBot) {
            $question->increment('view_count');
        }

        return back();
    }

    public function create(): Response
    {
        abort_unless(Auth::check(), 403);

        [$departments, $semesters, $courses, $examTypes] = cache()->remember('question_form_options', 3600, fn () => [
            Department::select('id', 'name')->orderBy('name')->get(),
            Semester::select('id', 'name')->orderBy('name', 'desc')->get(),
            Course::select('id', 'name', 'department_id')->orderBy('name')->get(),
            ExamType::select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ]);

        return Inertia::render('questions/create', [
            'departments' => $departments,
            'semesters' => $semesters,
            'courses' => $courses,
            'examTypes' => $examTypes,
        ]);
    }

    public function store(StoreQuestionRequest $request)
    {
        $question = Question::create([
            'user_id' => Auth::id(),
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
            'view_count' => 0,
        ]);

        if ($request->hasFile('pdf')) {
            $question->addMediaFromRequest('pdf')->toMediaCollection('pdf');
        }

        return redirect()->route('questions.show', $question)->with('success', 'Question created successfully!');
    }

    public function edit(Question $question): Response
    {
        abort_unless(Auth::check() && Auth::id() === $question->user_id, 403);

        [$departments, $semesters, $courses, $examTypes] = cache()->remember('question_form_options', 3600, fn () => [
            Department::select('id', 'name')->orderBy('name')->get(),
            Semester::select('id', 'name')->orderBy('name', 'desc')->get(),
            Course::select('id', 'name', 'department_id')->orderBy('name')->get(),
            ExamType::select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ]);

        return Inertia::render('questions/edit', [
            'question' => [
                'id' => $question->id,
                'department_id' => $question->department_id,
                'course_id' => $question->course_id,
                'semester_id' => $question->semester_id,
                'exam_type_id' => $question->exam_type_id,
                'section' => $question->section,
                'pdf_url' => $question->pdf_url,
            ],
            'departments' => $departments,
            'semesters' => $semesters,
            'courses' => $courses,
            'examTypes' => $examTypes,
        ]);
    }

    public function update(UpdateQuestionRequest $request, Question $question)
    {
        $question->update([
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
        ]);

        if ($request->hasFile('pdf')) {
            $question->clearMediaCollection('pdf');
            $question->addMediaFromRequest('pdf')->toMediaCollection('pdf');
        }

        return redirect()->route('questions.show', $question)->with('success', 'Question updated successfully!');
    }
}
