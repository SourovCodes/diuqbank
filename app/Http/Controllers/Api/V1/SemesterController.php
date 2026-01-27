<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreSemesterRequest;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    /**
     * Store a newly created semester in storage.
     */
    public function store(StoreSemesterRequest $request): JsonResponse
    {
        $semester = Semester::create([
            'name' => $request->validated('name'),
        ]);

        return response()->json([
            'data' => $semester,
            'message' => 'Semester created successfully.',
        ], 201);
    }
}
