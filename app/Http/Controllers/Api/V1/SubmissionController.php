<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreSubmissionRequest;
use App\Http\Requests\Api\V1\UpdateSubmissionRequest;
use App\Http\Resources\Api\V1\SubmissionResource;
use App\Models\Question;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    /**
     * Display a listing of submissions for authenticated user.
     */
    public function index(): AnonymousResourceCollection
    {
        $submissions = Submission::query()
            ->where('user_id', auth()->id())
            ->with(['question.department', 'question.course', 'question.semester', 'question.examType'])
            ->withCount([
                'votes as upvotes_count' => fn ($query) => $query->where('value', 1),
                'votes as downvotes_count' => fn ($query) => $query->where('value', -1),
            ])
            ->latest()
            ->paginate(15);

        return SubmissionResource::collection($submissions);
    }

    /**
     * Store a newly created submission in storage.
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $submission = DB::transaction(function () use ($validated) {
            // Find or create the question
            $question = Question::query()->firstOrCreate(
                [
                    'department_id' => $validated['department_id'],
                    'course_id' => $validated['course_id'],
                    'semester_id' => $validated['semester_id'],
                    'exam_type_id' => $validated['exam_type_id'],
                ],
                [
                    'status' => $this->determineQuestionStatusFromValidated($validated),
                ]
            );

            // Create the submission
            $submission = Submission::query()->create([
                'question_id' => $question->id,
                'user_id' => auth()->id(),
                'views' => 0,
            ]);

            // Add the PDF to the submission
            $submission->addMedia($validated['pdf'])
                ->toMediaCollection('pdf');

            return $submission;
        });

        $submission->load(['question.department', 'question.course', 'question.semester', 'question.examType'])
            ->loadCount([
                'votes as upvotes_count' => fn ($query) => $query->where('value', 1),
                'votes as downvotes_count' => fn ($query) => $query->where('value', -1),
            ]);

        return (new SubmissionResource($submission))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the specified submission in storage.
     */
    public function update(UpdateSubmissionRequest $request, Submission $submission): SubmissionResource
    {
        $validated = $request->validated();

        DB::transaction(function () use ($submission, $validated) {
            // Update question if any question-related fields are provided
            if (
                isset($validated['department_id']) ||
                isset($validated['course_id']) ||
                isset($validated['semester_id']) ||
                isset($validated['exam_type_id'])
            ) {
                $questionData = [
                    'department_id' => $validated['department_id'] ?? $submission->question->department_id,
                    'course_id' => $validated['course_id'] ?? $submission->question->course_id,
                    'semester_id' => $validated['semester_id'] ?? $submission->question->semester_id,
                    'exam_type_id' => $validated['exam_type_id'] ?? $submission->question->exam_type_id,
                ];

                // Find or create the new question
                $question = Question::query()->firstOrCreate(
                    $questionData,
                    [
                        'status' => $this->determineQuestionStatus(
                            $questionData['department_id'],
                            $questionData['course_id'],
                            $questionData['semester_id'],
                            $questionData['exam_type_id']
                        ),
                    ]
                );

                // Update submission's question
                $submission->update([
                    'question_id' => $question->id,
                ]);
            }

            // Update PDF if provided
            if (isset($validated['pdf'])) {
                $submission->addMedia($validated['pdf'])
                    ->toMediaCollection('pdf');
            }
        });

        $submission->load(['question.department', 'question.course', 'question.semester', 'question.examType'])
            ->loadCount([
                'votes as upvotes_count' => fn ($query) => $query->where('value', 1),
                'votes as downvotes_count' => fn ($query) => $query->where('value', -1),
            ]);

        return new SubmissionResource($submission->fresh(['question.department', 'question.course', 'question.semester', 'question.examType']));
    }

    /**
     * Determine question status based on whether all parameters have published questions.
     */
    protected function determineQuestionStatus(int $departmentId, int $courseId, int $semesterId, int $examTypeId): QuestionStatus
    {
        $hasDepartmentPublished = Question::query()
            ->where('department_id', $departmentId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasCoursePublished = Question::query()
            ->where('course_id', $courseId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasSemesterPublished = Question::query()
            ->where('semester_id', $semesterId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        $hasExamTypePublished = Question::query()
            ->where('exam_type_id', $examTypeId)
            ->where('status', QuestionStatus::Published)
            ->exists();

        if ($hasDepartmentPublished && $hasCoursePublished && $hasSemesterPublished && $hasExamTypePublished) {
            return QuestionStatus::Published;
        }

        return QuestionStatus::PendingReview;
    }

    /**
     * Determine question status from validated request data.
     */
    protected function determineQuestionStatusFromValidated(array $validated): QuestionStatus
    {
        return $this->determineQuestionStatus(
            $validated['department_id'],
            $validated['course_id'],
            $validated['semester_id'],
            $validated['exam_type_id']
        );
    }
}
