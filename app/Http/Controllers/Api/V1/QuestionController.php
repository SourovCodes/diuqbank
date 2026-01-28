<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Question\IndexQuestionRequest;
use App\Models\Question;
use App\Services\QuestionCacheService;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    public function __construct(
        protected QuestionCacheService $cacheService
    ) {}

    /**
     * Display a listing of published questions.
     */
    public function index(IndexQuestionRequest $request): JsonResponse
    {
        $data = $this->cacheService->getIndex(
            $request->validated('department_id'),
            $request->validated('course_id'),
            $request->validated('semester_id'),
            $request->validated('exam_type_id'),
            $request->validated('per_page', 15),
            $request->integer('page', 1),
        );

        return response()->json($data);
    }

    /**
     * Display the specified published question.
     */
    public function show(Question $question): JsonResponse
    {
        abort_unless($question->status === QuestionStatus::Published, 404);

        $data = $this->cacheService->getShow($question);

        return response()->json($data);
    }
}
