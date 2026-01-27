<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Question\IndexQuestionRequest;
use App\Http\Resources\Api\V1\QuestionIndexResource;
use App\Http\Resources\Api\V1\QuestionResource;
use App\Models\Question;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuestionController extends Controller
{
    /**
     * Display a listing of published questions.
     */
    public function index(IndexQuestionRequest $request): AnonymousResourceCollection
    {
        $questions = Question::query()
            ->published()
            ->filtered(
                $request->validated('department_id'),
                $request->validated('course_id'),
                $request->validated('semester_id'),
                $request->validated('exam_type_id'),
            )
            ->with(['department', 'course', 'semester', 'examType'])
            ->withMax('submissions', 'views')
            ->latest()
            ->paginate($request->validated('per_page', 15));

        return QuestionIndexResource::collection($questions);
    }

    /**
     * Display the specified published question.
     */
    public function show(Question $question): QuestionResource
    {
        abort_unless($question->status === QuestionStatus::Published, 404);

        $question->load(['department', 'course', 'semester', 'examType'])
            ->load(['submissions' => function ($query) {
                $query->with('user')
                    ->withCount([
                        'votes as upvotes_count' => fn ($q) => $q->where('value', 1),
                        'votes as downvotes_count' => fn ($q) => $q->where('value', -1),
                    ])
                    ->orderByRaw('(SELECT COALESCE(SUM(value), 0) FROM votes WHERE votes.submission_id = submissions.id) DESC')
                    ->limit(30);
            }]);

        return new QuestionResource($question);
    }
}
