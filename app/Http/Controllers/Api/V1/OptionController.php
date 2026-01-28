<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\JsonResponse;

class OptionController extends Controller
{
    /**
     * Get all form options (departments, courses, semesters, exam types).
     */
    public function __invoke(QuestionFormOptionsRepository $repository): JsonResponse
    {
        return response()->json([
            'data' => $repository->getApiOptions(),
        ]);
    }
}
