<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use App\Services\QuestionDuplicateChecker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuestionPageController extends Controller
{
    public function __construct(
        protected QuestionDuplicateChecker $duplicateChecker,
        protected QuestionFormOptionsRepository $formOptionsRepository
    ) {}

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
