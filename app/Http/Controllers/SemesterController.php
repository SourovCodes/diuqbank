<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSemesterRequest;
use App\Models\Semester;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    public function __construct(protected QuestionFormOptionsRepository $optionsRepository) {}

    public function store(StoreSemesterRequest $request): JsonResponse
    {
        $semester = Semester::create($request->validated());

        $this->optionsRepository->clearCache();

        return response()->json([
            'semester' => [
                'id' => $semester->id,
                'name' => $semester->name,
            ],
        ], 201);
    }
}
