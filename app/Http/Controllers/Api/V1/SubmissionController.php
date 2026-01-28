<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DestroySubmissionRequest;
use App\Http\Requests\Api\V1\StoreSubmissionRequest;
use App\Http\Requests\Api\V1\UpdateSubmissionRequest;
use App\Http\Resources\Api\V1\SubmissionResource;
use App\Models\Question;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    /**
     * Display a listing of submissions for authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->input('per_page', 15), 100);

        $submissions = Submission::query()
            ->where('user_id', $request->user()->id)
            ->with(Submission::QUESTION_RELATIONS)
            ->withVoteCounts()
            ->latest()
            ->paginate($perPage);

        return SubmissionResource::collection($submissions);
    }

    /**
     * Store a newly created submission in storage.
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $submission = DB::transaction(function () use ($request, $validated) {
            $question = Question::query()->firstOrCreate(
                [
                    'department_id' => $validated['department_id'],
                    'course_id' => $validated['course_id'],
                    'semester_id' => $validated['semester_id'],
                    'exam_type_id' => $validated['exam_type_id'],
                ],
                [
                    'status' => $this->determineQuestionStatus(
                        $validated['department_id'],
                        $validated['course_id'],
                        $validated['semester_id'],
                        $validated['exam_type_id']
                    ),
                ]
            );

            $submission = Submission::query()->create([
                'question_id' => $question->id,
                'user_id' => $request->user()->id,
                'views' => 0,
            ]);

            $submission->addMedia($validated['pdf'])
                ->toMediaCollection(Submission::MEDIA_COLLECTION_PDF);

            return $submission;
        });

        $submission->load(Submission::QUESTION_RELATIONS)->loadVoteCounts();

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

        $submission->load('question');

        DB::transaction(function () use ($submission, $validated) {
            if ($this->hasQuestionFieldChanges($validated)) {
                $questionData = [
                    'department_id' => $validated['department_id'] ?? $submission->question->department_id,
                    'course_id' => $validated['course_id'] ?? $submission->question->course_id,
                    'semester_id' => $validated['semester_id'] ?? $submission->question->semester_id,
                    'exam_type_id' => $validated['exam_type_id'] ?? $submission->question->exam_type_id,
                ];

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

                if ($submission->question_id !== $question->id) {
                    $submission->votes()->delete();
                }

                $submission->update(['question_id' => $question->id]);
            }

            if (isset($validated['pdf'])) {
                $submission->addMedia($validated['pdf'])
                    ->toMediaCollection(Submission::MEDIA_COLLECTION_PDF);
            }
        });

        $submission->load(Submission::QUESTION_RELATIONS)->loadVoteCounts();

        return new SubmissionResource($submission);
    }

    /**
     * Remove the specified submission from storage.
     */
    public function destroy(DestroySubmissionRequest $request, Submission $submission): JsonResponse
    {
        $submission->delete();

        return response()->json(null, 204);
    }

    /**
     * Check if any question-related fields are being updated.
     */
    protected function hasQuestionFieldChanges(array $validated): bool
    {
        return isset($validated['department_id'])
            || isset($validated['course_id'])
            || isset($validated['semester_id'])
            || isset($validated['exam_type_id']);
    }

    /**
     * Determine question status based on whether all parameters have published questions.
     */
    protected function determineQuestionStatus(int $departmentId, int $courseId, int $semesterId, int $examTypeId): QuestionStatus
    {
        $publishedCounts = Question::query()
            ->where('status', QuestionStatus::Published)
            ->where(function ($query) use ($departmentId, $courseId, $semesterId, $examTypeId) {
                $query->where('department_id', $departmentId)
                    ->orWhere('course_id', $courseId)
                    ->orWhere('semester_id', $semesterId)
                    ->orWhere('exam_type_id', $examTypeId);
            })
            ->selectRaw('
                MAX(CASE WHEN department_id = ? THEN 1 ELSE 0 END) as has_department,
                MAX(CASE WHEN course_id = ? THEN 1 ELSE 0 END) as has_course,
                MAX(CASE WHEN semester_id = ? THEN 1 ELSE 0 END) as has_semester,
                MAX(CASE WHEN exam_type_id = ? THEN 1 ELSE 0 END) as has_exam_type
            ', [$departmentId, $courseId, $semesterId, $examTypeId])
            ->first();

        if (
            $publishedCounts &&
            $publishedCounts->has_department &&
            $publishedCounts->has_course &&
            $publishedCounts->has_semester &&
            $publishedCounts->has_exam_type
        ) {
            return QuestionStatus::Published;
        }

        return QuestionStatus::PendingReview;
    }
}
