<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionDetailResource;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use App\Services\QuestionDuplicateChecker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuestionPageController extends Controller
{
    public function __construct(
        protected QuestionDuplicateChecker $duplicateChecker,
        protected QuestionFormOptionsRepository $formOptionsRepository
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $parseFilterId = static function (?string $value): ?int {
            return is_numeric($value) ? (int) $value : null;
        };

        $departmentId = $parseFilterId($request->input('department'));
        $semesterId = $parseFilterId($request->input('semester'));
        $courseId = $parseFilterId($request->input('course'));
        $examTypeId = $parseFilterId($request->input('examType'));

        $filterOptions = $this->formOptionsRepository->getFilterOptions();

        // Validate filters
        $invalidFiltersDetected = $this->hasInvalidFilters(
            departmentId: $departmentId,
            semesterId: $semesterId,
            courseId: $courseId,
            examTypeId: $examTypeId,
            filterOptions: $filterOptions
        );

        if ($invalidFiltersDetected) {
            return redirect()->route('questions.index', array_filter([
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
                'page' => $request->integer('page') > 1 ? $request->integer('page') : null,
            ], static fn ($value) => $value !== null));
        }

        // Build query with filters
        $query = Question::query()->published();

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

        $questions = $query
            ->with(['department', 'course', 'semester', 'examType'])
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // Transform questions using resource
        $questions->getCollection()->transform(fn ($question) => QuestionResource::make($question)->resolve());

        // Get visible courses based on department filter
        $visibleCourseOptions = $departmentId !== null
            ? $this->formOptionsRepository->getCoursesByDepartment($departmentId, $filterOptions['courses'])
            : $filterOptions['courses'];

        return Inertia::render('questions/index', [
            'questions' => $questions,
            'filters' => [
                'department' => $departmentId,
                'semester' => $semesterId,
                'course' => $courseId,
                'examType' => $examTypeId,
            ],
            'filterOptions' => [
                'departments' => $filterOptions['departments'],
                'semesters' => $filterOptions['semesters'],
                'courses' => $visibleCourseOptions,
                'examTypes' => $filterOptions['examTypes'],
            ],
        ]);
    }

    public function show(Question $question): Response
    {
        $question->load(['department', 'semester', 'course', 'examType', 'user', 'media']);

        return Inertia::render('questions/show', [
            'question' => QuestionDetailResource::make($question)->resolve(),
        ]);
    }

    public function incrementView(Question $question): RedirectResponse
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

        $formOptions = $this->formOptionsRepository->getFormOptions();

        return Inertia::render('questions/create', [
            'departments' => $formOptions['departments'],
            'semesters' => $formOptions['semesters'],
            'courses' => $formOptions['courses'],
            'examTypes' => $formOptions['examTypes'],
        ]);
    }

    public function store(StoreQuestionRequest $request): RedirectResponse
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated());

            if ($duplicate) {
                return back()->withErrors([
                    'duplicate' => 'A question with these exact details already exists. Please review and confirm if you want to proceed.',
                ])->withInput();
            }
        }

        $duplicateReason = $request->validated('duplicate_reason');

        $question = Question::create([
            'user_id' => Auth::id(),
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
            'view_count' => 0,
            'status' => $duplicateReason !== null ? QuestionStatus::PENDING_REVIEW : QuestionStatus::PUBLISHED,
            'under_review_reason' => $duplicateReason !== null ? UnderReviewReason::DUPLICATE : null,
            'duplicate_reason' => $duplicateReason,
        ]);

        if ($request->hasFile('pdf')) {
            $question->addMediaFromRequest('pdf')->toMediaCollection('pdf');
        }

        $message = $duplicateReason !== null
            ? 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.'
            : 'Question created successfully!';

        return redirect()->route('questions.show', $question)->with('success', $message);
    }

    public function edit(Question $question): Response
    {
        abort_unless(Auth::check() && Auth::id() === $question->user_id, 403);

        $formOptions = $this->formOptionsRepository->getFormOptions();

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
            'departments' => $formOptions['departments'],
            'semesters' => $formOptions['semesters'],
            'courses' => $formOptions['courses'],
            'examTypes' => $formOptions['examTypes'],
        ]);
    }

    public function update(UpdateQuestionRequest $request, Question $question): RedirectResponse
    {
        // Check for duplicate if not confirmed
        if (! $request->boolean('confirmed_duplicate')) {
            $duplicate = $this->duplicateChecker->check($request->validated(), $question->id);

            if ($duplicate) {
                return back()->withErrors([
                    'duplicate' => 'A question with these exact details already exists. Please review and confirm if you want to proceed.',
                ])->withInput();
            }
        }

        $duplicateReason = $request->validated('duplicate_reason');

        $question->update([
            'department_id' => $request->validated('department_id'),
            'course_id' => $request->validated('course_id'),
            'semester_id' => $request->validated('semester_id'),
            'exam_type_id' => $request->validated('exam_type_id'),
            'section' => $request->validated('section'),
            'status' => $duplicateReason !== null ? QuestionStatus::PENDING_REVIEW : $question->status,
            'under_review_reason' => $duplicateReason !== null ? UnderReviewReason::DUPLICATE : $question->under_review_reason,
            'duplicate_reason' => $duplicateReason,
        ]);

        if ($request->hasFile('pdf')) {
            $question->clearMediaCollection('pdf');
            $question->addMediaFromRequest('pdf')->toMediaCollection('pdf');
        }

        $message = $duplicateReason !== null
            ? 'Question submitted for review. Our team will verify if it\'s a duplicate and get back to you.'
            : 'Question updated successfully!';

        return redirect()->route('questions.show', $question)->with('success', $message);
    }

    /**
     * Validate filter parameters against available options.
     */
    protected function hasInvalidFilters(
        ?int $departmentId,
        ?int $semesterId,
        ?int $courseId,
        ?int $examTypeId,
        array $filterOptions
    ): bool {
        if ($departmentId !== null && ! collect($filterOptions['departments'])->contains('id', $departmentId)) {
            return true;
        }

        if ($semesterId !== null && ! collect($filterOptions['semesters'])->contains('id', $semesterId)) {
            return true;
        }

        if ($courseId !== null) {
            $course = collect($filterOptions['courses'])->firstWhere('id', $courseId);

            if ($course === null) {
                return true;
            }

            if ($departmentId !== null && (int) $course->department_id !== $departmentId) {
                return true;
            }
        }

        if ($examTypeId !== null && ! collect($filterOptions['examTypes'])->contains('id', $examTypeId)) {
            return true;
        }

        return false;
    }
}
