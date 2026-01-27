<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\QuestionIndexResource;
use App\Http\Resources\Api\V1\QuestionResource;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuestionController extends Controller
{
    /**
     * Display a listing of published questions.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $questions = Question::query()
            ->published()
            ->filtered(
                $request->query('department_id'),
                $request->query('course_id'),
                $request->query('semester_id'),
                $request->query('exam_type_id'),
            )
            ->with(['department', 'course', 'semester', 'examType'])
            ->withMax('submissions', 'views')
            ->latest()
            ->paginate($request->query('per_page', 15));

        return QuestionIndexResource::collection($questions);
    }

    /**
     * Display the specified published question.
     */
    public function show(Question $question): QuestionResource
    {
        abort_unless($question->status->value === 'published', 404);

        $question->load(['department', 'course', 'semester', 'examType'])
            ->loadCount('submissions');

        return new QuestionResource($question);
    }
}
