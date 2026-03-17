<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\SubmissionResource;
use App\Models\Question;
use App\Repositories\QuestionFormOptionsRepository;
use App\Services\QuestionFilterValidator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function __construct(
        private QuestionFormOptionsRepository $optionsRepository,
        private QuestionFilterValidator $filterValidator
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $departmentId = $request->filled('department_id') ? $request->integer('department_id') : null;
        $courseId = $request->filled('course_id') ? $request->integer('course_id') : null;
        $semesterId = $request->filled('semester_id') ? $request->integer('semester_id') : null;
        $examTypeId = $request->filled('exam_type_id') ? $request->integer('exam_type_id') : null;

        // Load filter options for validation
        $filterOptions = $this->optionsRepository->getFilterOptions($departmentId);

        // Check for invalid filter parameters
        $invalidParams = $this->filterValidator->getInvalidParams(
            $filterOptions,
            $departmentId,
            $courseId,
            $semesterId,
            $examTypeId
        );

        // If any invalid parameters found, redirect without them
        if (count($invalidParams) > 0) {
            $validParams = $request->except($invalidParams);

            return redirect()->route('questions.index', $validParams);
        }

        $questions = Question::query()
            ->with(['department', 'course', 'semester', 'examType'])
            ->withCount('submissions')
            ->published()
            ->department($departmentId)
            ->course($courseId)
            ->semester($semesterId)
            ->examType($examTypeId)
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('questions/index', [
            'questions' => QuestionResource::collection($questions),
            'filterOptions' => $filterOptions,
            'filters' => [
                'department' => $departmentId,
                'course' => $courseId,
                'semester' => $semesterId,
                'examType' => $examTypeId,
            ],
        ]);
    }

    public function show(Question $question): Response
    {
        abort_unless($question->status === QuestionStatus::Published, 404);

        $question->load(['department', 'course', 'semester', 'examType']);

        $submissions = $question->submissions()
            ->with(['user', 'media'])
            ->withSum('votes', 'value')
            ->orderByDesc('votes_sum_value')
            ->get();

        return Inertia::render('questions/show', [
            'question' => (new QuestionResource($question))->resolve(),
            'submissions' => SubmissionResource::collection($submissions)->resolve(),
        ]);
    }
}
