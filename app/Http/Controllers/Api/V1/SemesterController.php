<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreSemesterRequest;
use App\Http\Resources\Api\V1\SemesterResource;
use App\Models\Semester;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    /**
     * Store a newly created semester in storage.
     */
    public function store(StoreSemesterRequest $request, QuestionFormOptionsRepository $repository): JsonResponse
    {
        $semester = Semester::create([
            'name' => $request->validated('name'),
        ]);

        $repository->clearCache();

        return (new SemesterResource($semester))->response()
            ->setStatusCode(201);
    }
}
